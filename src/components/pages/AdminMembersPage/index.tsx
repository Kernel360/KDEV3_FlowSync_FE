"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  createListCollection,
  Heading,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import { Switch } from "@/src/components/ui/switch";
import CommonTable from "@/src/components/common/CommonTable";
import Pagination from "@/src/components/common/Pagination";
import { formatDynamicDate } from "@/src/utils/formatDateUtil";
import SearchSection from "@/src/components/common/SearchSection";
import FilterSelectBox from "@/src/components/common/FilterSelectBox";
import { useMemberList } from "@/src/hook/useFetchBoardList";
import ErrorAlert from "@/src/components/common/ErrorAlert";
import {
  activateMemberApi,
  deactivateMemberApi,
  deleteMember,
} from "@/src/api/members";
import { MemberProps } from "@/src/types";
import DropDownMenu from "@/src/components/common/DropDownMenu";

const memberRoleFramework = createListCollection<{
  label: string;
  value: string;
}>({
  items: [
    { label: "전체", value: "" },
    { label: "관리자", value: "ADMIN" },
    { label: "일반회원", value: "MEMBER" },
  ],
});

const memberStatusFramework = createListCollection<{
  label: string;
  value: string;
}>({
  items: [
    { label: "전체", value: "" },
    { label: "활성화", value: "ACTIVE" },
    { label: "비활성화", value: "INACTIVE" },
    { label: "삭제됨", value: "DELETED" },
  ],
});

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "관리자",
  MEMBER: "일반회원",
};

// const renderStatusSwitch = (status: string) => {
//   if (status === "DELETED") {
//     return <Switch disabled>Activate Chakra</Switch>; // 삭제된 경우, 비활성화된 Switch
//   }
//   return <Switch checked={status === "ACTIVE"} />;
// };

export default function AdminMembersPage() {
  return (
    <Suspense>
      <AdminMembersPageContent />
    </Suspense>
  );
}

function AdminMembersPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const keyword = searchParams?.get("keyword") || "";
  const role = searchParams?.get("role") || "";
  const status = searchParams?.get("status") || "";
  const currentPage = parseInt(searchParams?.get("currentPage") || "1", 10);
  const pageSize = parseInt(searchParams?.get("pageSize") || "10", 10);

  const {
    data: memberList,
    paginationInfo,
    loading: memberListLoading,
    error: memberListError,
    refetch,
  } = useMemberList(keyword, role, status, currentPage, pageSize);

  // ✅ 상태 변경을 위한 로컬 상태 추가
  const [memberData, setMemberData] = useState<MemberProps[]>([]);
  useEffect(() => {
    if (memberList) {
      setMemberData(memberList);
    }
  }, [memberList]);
  const [loadingId, setLoadingId] = useState<string | null>(null); // ✅ 특정 회원의 Switch 로딩 상태

  // ✅ 회원 상태 변경 핸들러 (API 호출 및 UI 반영)
  const handleStatusChange = async (
    memberId: string,
    currentStatus: string,
  ) => {
    setLoadingId(memberId); // ✅ 변경 중인 ID 설정 (로딩 표시)

    try {
      if (currentStatus === "ACTIVE") {
        await deactivateMemberApi(memberId); // 비활성화 API 호출
      } else {
        await activateMemberApi(memberId); // 활성화 API 호출
      }

      alert("회원 상태가 변경되었습니다.");

      // ✅ API 호출 후 로컬 상태 업데이트 (UI 즉시 반영)
      setMemberData((prevMembers) =>
        (prevMembers || []).map((member) =>
          member.id === memberId
            ? {
                ...member,
                status: currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE",
              }
            : member,
        ),
      );
    } catch (error) {
      console.error("회원 상태 변경 실패:", error);
      alert("회원 상태 변경 중 오류가 발생했습니다.");
    } finally {
      setLoadingId(null); // 로딩 해제
    }
  };

  // 신규등록 버튼 클릭 시 - 회원 등록 페이지로 이동
  const handleMemberCreateButton = () => {
    router.push("/admin/members/create");
  };

  // 페이지 변경 시 새로운 데이터를 가져오는 함수
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    // 쿼리스트링 업데이트
    params.set("currentPage", page.toString());
    // URL 업데이트
    router.push(`?${params.toString()}`);
  };

  const handleRowClick = (id: string) => {
    router.push(`/admin/members/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/members/${id}`);
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("정말로 삭제하시겠습니까?");
    if (!confirmDelete) return;
    try {
      await deleteMember(id, "");
      alert("회원이 탈퇴 조치 되었습니다.");
      refetch();
    } catch (error) {
      alert(`삭제 중 문제가 발생했습니다 : ${error}`);
    }
  };

  return (
    <>
      <Stack width="full">
        <Heading size="2xl" color="gray.600">
          회원 관리
        </Heading>
        <Box display="flex" justifyContent="space-between">
          <Button
            variant={"surface"}
            backgroundColor="#00a8ff"
            color="white"
            border="none"
            transition="all 0.3s ease"
            _hover={{
              backgroundColor: "#00aaffb9",
              cursor: "pointer",
            }}
            onClick={handleMemberCreateButton}
          >
            신규 등록
          </Button>
          <SearchSection keyword={keyword} placeholder="회원명 입력">
            <FilterSelectBox
              statusFramework={memberRoleFramework}
              selectedValue={role}
              queryKey="role"
              placeholder="역할"
            />
            <FilterSelectBox
              statusFramework={memberStatusFramework}
              selectedValue={status}
              queryKey="status"
              placeholder="활성화 여부"
            />
          </SearchSection>
        </Box>
        {memberListError && (
          <ErrorAlert message="회원 목록을 불러오지 못했습니다. 다시 시도해주세요." />
        )}
        <CommonTable
          columnsWidth={
            <>
              <Table.Column htmlWidth="10%" />
              <Table.Column htmlWidth="15%" />
              <Table.Column htmlWidth="15%" />
              <Table.Column htmlWidth="15%" />
              <Table.Column htmlWidth="20%" />
              <Table.Column htmlWidth="12%" />
              <Table.Column htmlWidth="10%" />
              <Table.Column htmlWidth="5%" />
              <Table.Column htmlWidth="5%" />
            </>
          }
          headerTitle={
            <Table.Row
              backgroundColor={"#eee"}
              css={{
                "& > th": { textAlign: "center" },
              }}
            >
              <Table.ColumnHeader>역할</Table.ColumnHeader>
              <Table.ColumnHeader>회원명</Table.ColumnHeader>
              <Table.ColumnHeader>소속 업체명</Table.ColumnHeader>
              <Table.ColumnHeader>직무 | 직책</Table.ColumnHeader>
              <Table.ColumnHeader>이메일</Table.ColumnHeader>
              <Table.ColumnHeader>연락처</Table.ColumnHeader>
              <Table.ColumnHeader>등록일</Table.ColumnHeader>
              <Table.ColumnHeader>상태</Table.ColumnHeader>
              <Table.ColumnHeader>관리</Table.ColumnHeader>
            </Table.Row>
          }
          data={memberData} // 로컬 상태 활용
          loading={memberListLoading}
          renderRow={(member: MemberProps) => (
            <Table.Row
              key={member.id}
              onClick={() => handleRowClick(member.id)}
              css={{
                cursor: "pointer",
                "&:hover": { backgroundColor: "#f5f5f5" },
                "& > td": {
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
              }}
            >
              <Table.Cell>
                {ROLE_LABELS[member.role] || "알 수 없음"}
              </Table.Cell>
              <Table.Cell>{member.name}</Table.Cell>
              <Table.Cell>{member.organizationName}</Table.Cell>
              <Table.Cell>{`${member.jobRole} | ${member.jobTitle}`}</Table.Cell>
              <Table.Cell>{member.email}</Table.Cell>
              <Table.Cell>{member.phoneNum}</Table.Cell>
              <Table.Cell>{formatDynamicDate(member.regAt)}</Table.Cell>
              <Table.Cell onClick={(event) => event.stopPropagation()}>
                {member.status === "DELETED" ? (
                  <Text color="red">삭제됨</Text>
                ) : (
                  <Switch
                    checked={member.status === "ACTIVE"}
                    onChange={(event) => {
                      event.stopPropagation();
                      handleStatusChange(member.id, member.status);
                    }}
                    disabled={loadingId === member.id} // ✅ 상태 변경 시 로딩 적용
                  />
                )}
              </Table.Cell>
              <Table.Cell onClick={(event) => event.stopPropagation()}>
                <DropDownMenu
                  onEdit={() => handleEdit(member.id)}
                  onDelete={() => handleDelete(member.id)}
                />
              </Table.Cell>
            </Table.Row>
          )}
        />
        {paginationInfo && (
          <Pagination
            paginationInfo={paginationInfo}
            handlePageChange={handlePageChange}
          />
        )}
      </Stack>
    </>
  );
}
