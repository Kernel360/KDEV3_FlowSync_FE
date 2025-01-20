"use client";

import { Heading, Stack, Table } from "@chakra-ui/react";
import CommonTable from "../../common/CommonTable";
import { CustomBox } from "../../common/CustomBox";
import Pagination from "../../common/Pagination";
import { useRouter } from "next/navigation";
import MembersSearchSection from "../../common/MembersSearchSection";
import { useMemberList } from "@/src/hook/useMemberList";
import MemberTable from "../../common/MemberTable";
import { Suspense } from "react";

const STATUS_LABELS: Record<string, string> = {
  ING_WORK: "근무 O",
  STOP_WORK: "근무 X",
};

export default function AdminMembersPage() {
  return (
    <Suspense>
      <AdminMembersPageContent />
    </Suspense>
  );
}

function AdminMembersPageContent() {
  const { memberList, paginationInfo, loading, fetchMemberList } =
    useMemberList();
  const router = useRouter();

  // 페이지 변경 시 새로운 데이터를 가져오는 함수
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    // 쿼리스트링 업데이트
    params.set("page", page.toString());
    // URL 업데이트
    router.push(`?${params.toString()}`);
    // 데이터를 다시 가져오기
    fetchMemberList(page, paginationInfo?.pageSize || 5);
  };

  return (
    <>
      <Stack width="full">
        <Heading size="2xl" color="gray.600">
          회원 관리
        </Heading>
        <MembersSearchSection />
        <MemberTable
          headerTitle={
            <Table.Row
              backgroundColor={"#eee"}
              css={{
                "& > th": { textAlign: "center" },
              }}>
              <Table.ColumnHeader>회원명</Table.ColumnHeader>
              <Table.ColumnHeader>소속 업체명</Table.ColumnHeader>
              <Table.ColumnHeader>직무</Table.ColumnHeader>
              <Table.ColumnHeader>이메일</Table.ColumnHeader>
              <Table.ColumnHeader>연락처</Table.ColumnHeader>
              <Table.ColumnHeader>근무 상태</Table.ColumnHeader>
            </Table.Row>
          }
          memberList={memberList}
          loading={loading}
          renderRow={(member) => (
            <>
              <Table.Cell>{member.name}</Table.Cell>
              <Table.Cell>{member.organizationId}</Table.Cell>
              <Table.Cell>{member.jobRole}</Table.Cell>
              <Table.Cell>{member.email}</Table.Cell>
              <Table.Cell>{member.phoneNum}</Table.Cell>
              <Table.Cell>
                <CustomBox>
                  {STATUS_LABELS[member.status] || "알 수 없음"}
                </CustomBox>
              </Table.Cell>
            </>
          )}
        />
        <Pagination
          paginationInfo={
            paginationInfo && {
              ...paginationInfo,
              currentPage: paginationInfo.currentPage + 1,
            }
          }
          handlePageChange={handlePageChange}
        />
      </Stack>
    </>
  );
}
