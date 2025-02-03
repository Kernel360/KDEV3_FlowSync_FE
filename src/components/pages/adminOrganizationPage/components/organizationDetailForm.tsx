"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Box, Flex, HStack } from "@chakra-ui/react";
import { Radio, RadioGroup } from "@/src/components/ui/radio";
import InputForm from "@/src/components/common/InputForm";
import InputFormLayout from "@/src/components/layouts/InputFormLayout";
import { OrganizationProps } from "@/src/types";
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
  // ✅ 각 필드별 변경 상태를 관리하는 객체
  const [isChanged, setIsChanged] = useState<{ [key: string]: boolean }>({});
  const isUpdateDisabled = Object.keys(isChanged).length === 0;
  const fileData =
    typeof formData.brCertificateUrl === "string" &&
    formData.brCertificateUrl.includes("|")
      ? formData.brCertificateUrl.split("|")
      : [null, null];

  useEffect(() => {
    return () => {
      if (
        formData.brCertificateUrl &&
        typeof formData.brCertificateUrl === "string" &&
        formData.brCertificateUrl.includes("|")
      ) {
        const [, fileUrl] = formData.brCertificateUrl.split("|");
        // 파일 교체 후에도 이전 파일이 유지될 가능성 방지
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [formData.brCertificateUrl]);

  // 📌 업체 데이터 다시 불러오기 (업데이트 후)
  async function refetchOrganizationData() {
    if (Object.keys(isChanged).length === 0) return; // 🔥 변경된 값 없으면 요청 안 함

    setIsFetching(true);
    try {
      const updatedData = await fetchOrganizationDetails(organizationId);
      setFormData(updatedData); // ✅ 새로 불러온 데이터로 상태 업데이트
      setIsChanged({}); // ✅ 모든 필드 변경 상태 초기화
    } catch (error) {
      console.error("업체 데이터 갱신 실패:", error);
    } finally {
      setIsFetching(false);
    }
  }

  function handleInputUpdate(inputName: string, value: string) {
    // 숫자만 남기기
    const onlyNumbers = value.replace(/[^0-9]/g, "");
    let formattedValue = onlyNumbers;

    // 입력값별 하이픈 추가 규칙 적용
    const formatWithHyphen = (value: string, pattern: number[]) => {
      let formatted = "";
      let index = 0;

      for (const length of pattern) {
        if (index >= value.length) break; // 🔥 안전한 길이 체크 추가
        if (index + length <= value.length) {
          formatted +=
            (index === 0 ? "" : "-") +
            value.slice(index, Math.min(value.length, index + length));
          index += length;
        } else {
          formatted += (index === 0 ? "" : "-") + value.slice(index);
          break;
        }
      }
      return formatted;
    };

    if (inputName === "phoneNumber") {
      formattedValue = formatWithHyphen(onlyNumbers, [3, 4, 4]); // 010-1234-5678
    } else if (inputName === "brNumber") {
      formattedValue = formatWithHyphen(onlyNumbers, [3, 2, 5]); // 123-45-67890
    }

    setFormData((prev) => {
      const key = inputName as keyof OrganizationProps; // 🔥 명시적으로 keyof OrganizationProps로 변환
      if (prev[key] === formattedValue) return prev;
      return { ...prev, [key]: formattedValue };
    });
    setIsChanged((prev) => {
      if (prev[inputName]) return prev; // 🔥 이미 변경된 상태면 업데이트 안 함
      return { ...prev, [inputName]: true };
    });
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
      // 수정된 데이터만 렌더링
      refetchOrganizationData();
      setIsChanged({}); // 모든 필드 변경 상태 및 스타일 초기화
      alert("업체 정보가 수정되었습니다.");
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
      alert("업체 삭제에 실패했습니다.");
    }
  }

  return (
    <>
      <InputFormLayout
        title="▹ 업체 상세 조회"
        onSubmit={handleUpdate}
        isLoading={isSubmitting}
        isDisabled={isUpdateDisabled} // 버튼 비활성화 조건 추가
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
              isChanged={!!isChanged["brNumber"]}
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
                      // 파일이 변경된 경우 isChanged에 반영
                      setIsChanged((prev) => ({
                        ...prev,
                        brCertificateUrl: true, // 파일 변경 감지 추가
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
          isChanged={!!isChanged["streetAddress"]}
        />
        <InputForm
          id="detailAddress"
          type="text"
          label="사업장 상세 주소"
          value={formData.detailAddress}
          onChange={(e) => handleInputUpdate("detailAddress", e.target.value)}
          error={errors.detailAddress ?? undefined} // 에러 null 값을 undefined로 변환 (이하 동일)
          isChanged={!!isChanged["detailAddress"]}
        />
        <InputForm
          id="phoneNumber"
          type="tel"
          label="대표자 연락처"
          value={formData.phoneNumber}
          onChange={(e) => handleInputUpdate("phoneNumber", e.target.value)}
          error={errors.phoneNumber ?? undefined} // 에러 null 값을 undefined로 변환 (이하 동일)
          isChanged={!!isChanged["phoneNumber"]}
        />
      </InputFormLayout>
    </>
  );
}
