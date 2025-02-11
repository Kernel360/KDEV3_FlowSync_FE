"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  createListCollection,
  Flex,
  Heading,
  Table,
} from "@chakra-ui/react";
import CommonTable from "@/src/components/common/CommonTable";
import SearchSection from "@/src/components/common/SearchSection";
import FilterSelectBox from "@/src/components/common/FilterSelectBox";
import Pagination from "@/src/components/common/Pagination";
import { formatDynamicDate } from "@/src/utils/formatDateUtil";
import CreateButton from "@/src/components/common/CreateButton";
import ErrorAlert from "@/src/components/common/ErrorAlert";
import { useNoticeList } from "@/src/hook/useFetchBoardList";
import { useUserInfo } from "@/src/hook/useFetchData";
import DropDownMenu from "../../common/DropDownMenu";
import { useDeleteNotice } from "@/src/hook/useMutationData";

const noticeStatusFramework = createListCollection<{
  label: string;
  value: string;
}>({
  items: [
    { label: "전체", value: "" },
    { label: "서비스 업데이트", value: "SERVICE_UPDATE" },
    { label: "정책변경", value: "POLICY_CHANGE" },
    { label: "점검안내", value: "MAINTENANCE" },
    { label: "기타", value: "OTHER" },
  ],
});

const noticeIsDeletedFramework = createListCollection<{
  label: string;
  value: string;
}>({
  items: [
    { label: "전체 보기", value: "" },
    { label: "삭제된 공지", value: "Y" },
    { label: "삭제되지 않은 공지", value: "N" },
  ],
});

const EMERGENCY_STYLE = {
  backgroundColor: "#FFEBEB", // 연한 빨강 (긴급 강조)
  fontWeight: "bold",
  border: "2px solid #D32F2F",
};

export default function NoticesPage() {
  return (
    <Suspense>
      <NoticesPageContent />
    </Suspense>
  );
}

function NoticesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const keyword = searchParams?.get("keyword") || "";
  const category = searchParams?.get("category") || "";
  const isDeleted = searchParams?.get("isDeleted") || "";
  const currentPage = parseInt(searchParams?.get("currentPage") || "1", 10);
  const pageSize = parseInt(searchParams?.get("pageSize") || "10", 10);

  const { data: userInfoData } = useUserInfo();
  const userRole = userInfoData?.role;
  const { mutate: deleteNotice } = useDeleteNotice();

  const {
    data: noticeList,
    paginationInfo,
    loading: noticeListLoading,
    error: noticeListError,
    refetch,
  } = useNoticeList(keyword, category, isDeleted, currentPage, pageSize);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    // 쿼리스트링 업데이트
    params.set("currentPage", page.toString());
    // URL 업데이트
    router.push(`?${params.toString()}`);
  };

  const handleRowClick = (noticeId: string) => {
    const params = new URLSearchParams(window.location.search);
    router.push(`/notices/${noticeId}?${params.toString()}`);
  };

  // 신규등록 버튼 클릭 시 - 공지사항 등록 페이지로 이동
  const handleNoticeCreateButton = () => {
    router.push(`/notices/new`);
  };

  const handleEdit = (noticeId: string) => {
    router.push(`/notices/${noticeId}/edit?${searchParams.toString()}`);
  };

  const handleDelete = async (noticeId: string) => {
    const confirmDelete = window.confirm("정말로 삭제하시겠습니까?");
    if (!confirmDelete) return;
    try {
      await deleteNotice(noticeId);
      alert("공지사항이 삭제되었습니다.");
      refetch();
    } catch (error) {
      alert(`삭제 중 문제가 발생했습니다 : ${error}`);
    }
  };

  return (
    <Box>
      <Heading size="2xl" color="gray.700" mb="10px">
        공지사항
      </Heading>

      {userRole === "ADMIN" ? (
        <Flex justifyContent="space-between">
          <CreateButton handleButton={handleNoticeCreateButton} />
          {/* 공지사항 검색/필터 섹션 (검색창, 필터 옵션 등) */}
          <SearchSection keyword={keyword} placeholder="제목 입력">
            <FilterSelectBox
              statusFramework={noticeStatusFramework}
              selectedValue={category}
              queryKey="category"
              width="120px"
            />
          </SearchSection>
        </Flex>
      ) : (
        <Flex justifyContent="end">
          {/* 공시사항 검색/필터 섹션 (검색창, 필터 옵션 등) */}
          <SearchSection keyword={keyword} placeholder="제목 입력">
            <FilterSelectBox
              statusFramework={noticeStatusFramework}
              selectedValue={category}
              queryKey="category"
              width="120px"
            />
          </SearchSection>
        </Flex>
      )}
      {noticeListError && (
        <ErrorAlert message="공지사항 목록을 불러오지 못했습니다. 다시 시도해주세요." />
      )}
      <CommonTable
        headerTitle={
          <Table.Row
            backgroundColor={"#eee"}
            css={{
              "& > th": { textAlign: "center" },
            }}
          >
            <Table.ColumnHeader>카테고리</Table.ColumnHeader>
            <Table.ColumnHeader>제목</Table.ColumnHeader>
            <Table.ColumnHeader>등록일</Table.ColumnHeader>
            {userRole === "ADMIN" ? (
              <>
                <Table.ColumnHeader>수정일</Table.ColumnHeader>
                <Table.ColumnHeader>
                  <Flex justifyContent="center" alignItems="center">
                    <FilterSelectBox
                      statusFramework={noticeIsDeletedFramework}
                      selectedValue={isDeleted}
                      queryKey="isDeleted"
                      width="150px"
                    />
                  </Flex>
                </Table.ColumnHeader>
                <Table.ColumnHeader>공지사항관리</Table.ColumnHeader>
              </>
            ) : (
              <></>
            )}
          </Table.Row>
        }
        data={noticeList}
        loading={noticeListLoading}
        renderRow={(notice) => {
          const isEmergency = notice.priority === "EMERGENCY";
          return (
            <>
              <Table.Cell {...(isEmergency ? EMERGENCY_STYLE : {})}>
                {notice.category}
              </Table.Cell>
              <Table.Cell {...(isEmergency ? EMERGENCY_STYLE : {})}>
                {notice.title}
              </Table.Cell>
              <Table.Cell {...(isEmergency ? EMERGENCY_STYLE : {})}>
                {formatDynamicDate(notice.regAt)}
              </Table.Cell>
              {userRole === "ADMIN" ? (
                <>
                  <Table.Cell {...(isEmergency ? EMERGENCY_STYLE : {})}>
                    {formatDynamicDate(notice.updatedAt)}
                  </Table.Cell>
                  <Table.Cell {...(isEmergency ? EMERGENCY_STYLE : {})}>
                    {notice.isDeleted}
                  </Table.Cell>
                  <Table.Cell onClick={(event) => event.stopPropagation()}>
                    <DropDownMenu
                      onEdit={() => handleEdit(notice.id)}
                      onDelete={() => handleDelete(notice.id)}
                    />
                  </Table.Cell>
                </>
              ) : (
                <></>
              )}
            </>
          );
        }}
        handleRowClick={handleRowClick}
      />
      <Pagination
        paginationInfo={
          paginationInfo && {
            ...paginationInfo,
            currentPage: paginationInfo.currentPage,
          }
        }
        handlePageChange={handlePageChange}
      />
    </Box>
  );
}
