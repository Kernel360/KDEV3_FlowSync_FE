"use client";

import { useParams, useRouter } from "next/navigation";
import { Box, Table, createListCollection } from "@chakra-ui/react";
import CommonTable from "@/src/components/common/CommonTable";
import CustomColorBox from "@/src/components/common/StatusTag";
import { ProjectLayout } from "@/src/components/layouts/ProjectLayout";
import SearchSection from "@/src/components/common/SearchSection";
import StatusSelectBox from "@/src/components/common/StatusSelectBox";
import { useProjectTaskList } from "@/src/hook/useProjectTaskList";
import ProgressStepSection from "@/src/components/common/ProgressStepSection";
import { useProjectQuestionProgressStep } from "@/src/hook/useProjectQuestionProgressStep";
import { formatDynamicDate } from "@/src/utils/formatDateUtil";

const taskStatusFramework = createListCollection<{
  id: string;
  label: string;
  value: string;
}>({
  items: [
    { id: "1", label: "전체", value: "" },
    { id: "2", label: "대기", value: "WAIT" },
    { id: "3", label: "반려", value: "SUSPENSION" },
    { id: "4", label: "승인", value: "COMPLETED" },
  ],
});

// 질문(소통관리) 데이터 예시
const dummyData = [
  {
    id: "1",
    title: "클라이언트 요청사항 정리",
    regAt: "2024-01-10",
    status: "진행중",
    category: "질문",
  },
  {
    id: "2",
    title: "QA 피드백 정리",
    regAt: "2024-01-12",
    status: "완료",
    category: "답변",
  },
];

export default function ProjectTasksPage() {
  const { keyword, status } = useProjectTaskList();
  const { projectId } = useParams();
  const router = useRouter();

  const handleRowClick = (taskId: string) => {
    router.push(`/projects/${projectId}/tasks/${taskId}`);
  };

  return (
    <ProjectLayout>
      {/* 프로젝트 단계 섹션 */}
      <ProgressStepSection
        fetchProgressStep={useProjectQuestionProgressStep}
        projectId={projectId as string}
      />
      <Box
        direction="column"
        padding="30px 23px"
        gap="8px"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="lg"
        boxShadow="md"
        mb="30px"
      >
        {/* 검색 섹션 */}
        <SearchSection
          keyword={keyword}
          fetchBoardList={useProjectTaskList}
          placeholder="제목 입력"
        >
          <StatusSelectBox
            statusFramework={taskStatusFramework}
            status={status}
          />
        </SearchSection>
        {/* 
          CommonTable: 게시글 목록을 렌더링하는 공통 테이블 컴포넌트
          - headerTitle: 테이블 헤더
          - data: 목록 데이터
          - loading: 로딩 상태
          - renderRow: 각 행의 셀을 어떻게 렌더링할지 정의
          - handleRowClick: 행 클릭 시 동작
        */}
        <CommonTable
          headerTitle={
            <Table.Row
              backgroundColor={"#eee"}
              css={{
                "& > th": { textAlign: "center" },
              }}
            >
              <Table.ColumnHeader>제목</Table.ColumnHeader>
              <Table.ColumnHeader>등록일</Table.ColumnHeader>
              <Table.ColumnHeader>상태</Table.ColumnHeader>
              <Table.ColumnHeader>유형</Table.ColumnHeader>
            </Table.Row>
          }
          data={dummyData}
          loading={false}
          renderRow={(item) => (
            <>
              <Table.Cell>{item.title}</Table.Cell>
              <Table.Cell>{formatDynamicDate(item.regAt)}</Table.Cell>
              <Table.Cell>
                <CustomColorBox>{item.status}</CustomColorBox>
              </Table.Cell>
              <Table.Cell>
                <CustomColorBox>{item.category}</CustomColorBox>
              </Table.Cell>
            </>
          )}
          handleRowClick={handleRowClick}
        />
      </Box>
    </ProjectLayout>
  );
}
