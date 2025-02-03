"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Box, Flex, HStack } from "@chakra-ui/react";
import { Radio, RadioGroup } from "@/src/components/ui/radio";
import InputForm from "@/src/components/common/InputForm";
import InputFormLayout from "@/src/components/layouts/InputFormLayout";
import { OrganizationProps } from "@/src/types";
import { validationRulesOfUpdatingMember } from "@/src/constants/validationRules"; // 유효성 검사 규칙 import
import {
  deleteOriginationWithReason,
  fetchOrganizationDetails,
  updateOrganization,
} from "@/src/api/organizations";
import styles from "@/src/components/common/InputForm.module.css";

export default function OrganizationDetailForm({
  organizationData,
  organizationId,
}: {
  organizationData: OrganizationProps; // 업체 상세 타입
  organizationId: string;
}) {
  const route = useRouter();
  const [formData, setFormData] = useState<OrganizationProps>(organizationData);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({}); // 유효성 검사 에러 상태
  const [isFetching, setIsFetching] = useState<boolean>(false); // ✅ 새로 렌더링 여부
  const fileData =
    typeof formData.brCertificateUrl === "string" &&
    formData.brCertificateUrl.includes("|")
      ? formData.brCertificateUrl.split("|")
      : [null, null];
  const fileName = fileData[0] ?? "파일을 선택하세요";
  const fileUrl = fileData[1];

  useEffect(() => {
    return () => {
      if (
        formData.brCertificateUrl &&
        typeof formData.brCertificateUrl === "string" &&
        formData.brCertificateUrl.includes("|")
      ) {
        const [, fileUrl] = formData.brCertificateUrl.split("|");
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [formData.brCertificateUrl]);

  // 📌 업체 데이터 다시 불러오기 (업데이트 후)
  async function refetchOrganizationData() {
    setIsFetching(true);
    try {
      const updatedData = await fetchOrganizationDetails(organizationId);
      setFormData(updatedData); // ✅ 새로 불러온 데이터로 상태 업데이트
    } catch (error) {
      console.error("업체 데이터 갱신 실패:", error);
    } finally {
      setIsFetching(false);
    }
  }

  function handleInputUpdate(inputName: string, value: string) {
    if (inputName === "phoneNumber") {
      // 📌 전화번호 입력 처리 (자동 하이픈 추가)
      console.log("연락처를 update 중입니다.");
      const onlyNumbers = value.toString().replace(/[^0-9]/g, "");
      let formattedValue = onlyNumbers;

      if (onlyNumbers.length > 3 && onlyNumbers.length <= 7) {
        formattedValue = `${onlyNumbers.slice(0, 3)}-${onlyNumbers.slice(3)}`;
      } else if (onlyNumbers.length > 7) {
        formattedValue = `${onlyNumbers.slice(0, 3)}-${onlyNumbers.slice(3, 7)}-${onlyNumbers.slice(7, 11)}`;
      }
      setFormData((prev) => ({
        ...prev,
        [inputName]: formattedValue,
      }));
    } else if (inputName === "brNumber") {
      console.log("사업자 등록번호를 update 중입니다.");
      // 📌 사업자 등록번호 입력 처리 (자동 하이픈 추가) => "123-45-67890" 형식
      const onlyNumbers = value.toString().replace(/[^0-9]/g, "");
      let formattedValue = onlyNumbers;

      if (onlyNumbers.length > 3 && onlyNumbers.length <= 5) {
        formattedValue = `${onlyNumbers.slice(0, 3)}-${onlyNumbers.slice(3)}`;
      } else if (onlyNumbers.length > 5) {
        formattedValue = `${onlyNumbers.slice(0, 3)}-${onlyNumbers.slice(3, 5)}-${onlyNumbers.slice(5, 10)}`;
      }
      setFormData((prev) => ({
        ...prev,
        [inputName]: formattedValue,
      }));
    } else {
      console.log("업체 정보 일반 입력 update 중입니다.");
      // 📌 일반 입력 처리
      setFormData((prev) => ({
        ...prev,
        [inputName]: value.toString,
      }));
    }
  }

  // 📌 입력값 변경 처리 및 유효성 검사 실행
  function handleChange(field: string, value: string) {
    // 유효성 검사 규칙이 있는 필드만 검사
    if (field in validationRulesOfUpdatingMember && typeof value === "string") {
      const isValid =
        validationRulesOfUpdatingMember[
          field as keyof typeof validationRulesOfUpdatingMember
        ].isValid(value);

      setErrors((prev) => ({
        ...prev,
        [field]: isValid
          ? null
          : validationRulesOfUpdatingMember[
              field as keyof typeof validationRulesOfUpdatingMember
            ].errorMessage,
      }));
    }
    console.log("입력값 변경 - field: ", field, " , value: ", value);
  }

  // 📌 전체 입력값 유효성 검사 (수정 버튼 활성화 여부 체크)
  function isFormValid() {
    return Object.values(errors).every((error) => !error);
  }

  // 📌 업체 정보 수정
  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    if (!isFormValid()) {
      alert("입력값을 다시 확인해주세요.");
      setIsSubmitting(false);
      return;
    }

    try {
      const organizationData = {
        type: formData.type,
        name: formData.name,
        brNumber: formData.brNumber,
        brCertificateUrl: formData.brCertificateUrl,
        streetAddress: formData.streetAddress,
        detailAddress: formData.detailAddress,
        phoneNumber: formData.phoneNumber,
      };

      const response = await updateOrganization(
        organizationId,
        organizationData,
        selectedFile, // 파일 전달,
      );
      alert("업체 정보가 수정되었습니다.");
      // #TODO 업데이트 방법1) 수정 후 최신 데이터만 렌더링 (-> 변경된 필드 초록색으로 변한 게 그대로 유지되는 문제)
      // await refetchOrganizationData();
      // #TODO 업데이트 방법2) 페이지 전체 새로고침 (-> 속도 느리고, 화면 깜빡여서 fetch만 하는 방향으로 수정되어야 함)
      window.location.reload();
      // #TODO 업데이트 방법3) 페이지 전체 새로고침 없이 데이터만 새로고침 (-> 변경된 필드 초록색 스타일 그대로 유지되는 문제)
      // route.refresh();
    } catch (error) {
      alert("수정 실패: 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // 📌 업체 삭제 - 탈퇴 사유 입력 ver.
  async function handleDelete(deleteReason: string) {
    if (!deleteReason.trim()) {
      alert("탈퇴 사유를 입력해주세요.");
      return;
    }
    try {
      await deleteOriginationWithReason(organizationId, deleteReason); // 탈퇴 사유 입력값 전달
      alert("업체가 삭제 조치 되었습니다.");
      route.push("/admin/organizations"); // 삭제 후 목록 페이지(회원 관리)로 이동
    } catch (error) {
      console.error("업체 삭제 중 오류 발생:", error);
      alert("업체 삭제에 실패했습니다.");
    }
  }

  return (
    <>
      <InputFormLayout
        title="▹ 업체 상세 조회"
        onSubmit={handleUpdate}
        isLoading={isSubmitting}
        onDelete={handleDelete}
        deleteEntityType="업체" // 삭제 대상 선택 ("회원" | "업체" | "프로젝트")
      >
        {/* 수정 불가 필드 */}
        <Box>
          <Flex direction="row" align="center" mb={4}>
            <span
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                color: "#4A5568",
              }}
            >
              업체 유형을 선택하세요
            </span>
            <span
              style={{ color: "red", marginLeft: "4px", marginRight: "24px" }}
            >
              *
            </span>
            <RadioGroup
              value={formData.type}
              onValueChange={(e) => handleInputUpdate("type", e.value)}
            >
              <HStack gap={6}>
                <Radio value="CUSTOMER" disabled>
                  고객사
                </Radio>
                <Radio value="DEVELOPER" disabled>
                  개발사
                </Radio>
              </HStack>
            </RadioGroup>
          </Flex>
        </Box>
        <InputForm
          id="name"
          type="text"
          label="업체명"
          value={formData.name}
          disabled
        />
        {/* 수정 가능 필드 */}
        <Flex gap={4} align="center">
          <Box flex="1">
            <InputForm
              id="brNumber"
              type="text"
              label="사업자 등록번호"
              placeholder="ex) 123-45-67890"
              value={formData.brNumber}
              error={errors.brNumber ?? undefined} // 에러 null 값을 undefined로 변환 (이하 동일)
              onChange={(e) => handleInputUpdate("brNumber", e.target.value)}
            />
          </Box>
          <Box flex="1" className={styles.inputFieldContainer}>
            <label htmlFor="businessLicense" className={styles.label}>
              사업자 등록증 첨부
              <span className={styles.required}>*</span>
            </label>
            <>
              <div className={styles.fileUploadContainer}>
                {/* ✅ 파일 첨부 버튼 */}
                <input
                  type="file"
                  id="businessLicense"
                  className={styles.fileInputHidden}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                      setFormData((prev) => ({
                        ...prev,
                        brCertificateUrl: `${file.name}|${URL.createObjectURL(file)}`,
                      }));
                    }
                  }}
                />
                <label
                  htmlFor="businessLicense"
                  className={styles.fileUploadButton}
                >
                  파일 첨부
                </label>
                {/* 파일명 출력 및 클릭 시 새 탭에서 열기 */}
                {formData.brCertificateUrl ? (
                  (() => {
                    const fileData =
                      typeof formData.brCertificateUrl === "string" &&
                      formData.brCertificateUrl.includes("|")
                        ? formData.brCertificateUrl.split("|")
                        : [formData.brCertificateUrl, null];

                    const fileName = fileData[0]
                      ? fileData[0].replace(/^\d+_/, "")
                      : "파일을 선택하세요";
                    const fileUrl = fileData[1] || formData.brCertificateUrl;

                    return fileUrl ? (
                      <a
                        href={fileUrl.split("|").pop()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.selectedFileName}
                      >
                        ✔ {fileName}
                      </a>
                    ) : (
                      <span
                        className={styles.selectedFileName}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        ✔ {fileName}
                      </span>
                    );
                  })()
                ) : (
                  <span
                    className={styles.selectedFileName}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    파일을 선택하세요
                  </span>
                )}
              </div>
            </>
            <span className={styles.errorText}> </span>
          </Box>
        </Flex>
        <InputForm
          id="streetAddress"
          type="address"
          label="사업장 도로명 주소"
          value={formData.streetAddress}
          onChange={(e) => handleInputUpdate("streetAddress", e.target.value)}
          error={errors.streetAddress ?? undefined} // 에러 null 값을 undefined로 변환 (이하 동일)
        />
        <InputForm
          id="detailAddress"
          type="text"
          label="사업장 상세 주소"
          value={formData.detailAddress}
          onChange={(e) => handleInputUpdate("detailAddress", e.target.value)}
          error={errors.detailAddress ?? undefined} // 에러 null 값을 undefined로 변환 (이하 동일)
        />
        <InputForm
          id="phoneNumber"
          type="tel"
          label="대표자 연락처"
          value={formData.phoneNumber}
          onChange={(e) => handleInputUpdate("phoneNumber", e.target.value)}
          error={errors.phoneNumber ?? undefined} // 에러 null 값을 undefined로 변환 (이하 동일)
        />
      </InputFormLayout>
    </>
  );
}
