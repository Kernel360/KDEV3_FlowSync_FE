import { useProjectList } from "@/src/hook/useProjectList";
import { Heading, Stack, Table } from "@chakra-ui/react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import ProjectsSearchSection from "./ProjectsSearchSection";
import ProjectStatusCards from "@/src/components/common/ProjectsStatusCards";
import CommonTable from "./CommonTable";
import { CustomBox } from "./CustomBox";
import Pagination from "./Pagination";

const STATUS_LABELS: Record<string, string> = {
  IN_PROGRESS: "진행중",
  PAUSED: "일시 중단",
  COMPLETED: "완료",
};

export default function ProjectsPageContent2() {
  const { projectList, paginationInfo, loading, fetchProjectList } = useProjectList();
  const router = useRouter();

  // 페이지 변경 시 새로운 데이터를 가져오는 함수
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    // 쿼리스트링 업데이트
    params.set("page", page.toString());
    // URL 업데이트
    router.push(`?${params.toString()}`);
    // 데이터를 다시 가져오기
    fetchProjectList(page, paginationInfo?.pageSize || 5);
  };

  const handleRowClick = (id: number) => {
    router.push(`/projects/${id}/tasks`);
  };

  return (
    <>
      <Head>
        <title>FlowSync</title>
        <meta property="og:image" content="@/public/FlowSyncLogo.jpg" />
        <meta property="og:title" content="FlowSync" />
        <meta property="og:description" content="FlowSync로 프로젝트 관리를 한번에" />
      </Head>
      <ProjectStatusCards title={"프로젝트 현황"} />
      <Stack width="full">
        <Heading size="2xl" color="gray.600">
          프로젝트 목록
        </Heading>
        <ProjectsSearchSection />
        <CommonTable
          headerTitle={
            <Table.Row
              backgroundColor={"#eee"}
              css={{
                "& > th": { textAlign: "center" },
              }}
            >
              <Table.ColumnHeader>프로젝트명</Table.ColumnHeader>
              <Table.ColumnHeader>고객사</Table.ColumnHeader>
              <Table.ColumnHeader>개발사</Table.ColumnHeader>
              <Table.ColumnHeader>프로젝트 상태</Table.ColumnHeader>
              <Table.ColumnHeader>프로젝트 시작일</Table.ColumnHeader>
              <Table.ColumnHeader>프로젝트 종료일</Table.ColumnHeader>
            </Table.Row>
          }
          data={projectList}
          loading={loading}
          renderRow={project => (
            <>
              <Table.Cell>{project.name}</Table.Cell>
              <Table.Cell>{project.customerName}</Table.Cell>
              <Table.Cell>{project.developerName}</Table.Cell>
              <Table.Cell>
                <CustomBox>{STATUS_LABELS[project.status] || "알 수 없음"}</CustomBox>
              </Table.Cell>
              <Table.Cell>{project.startAt}</Table.Cell>
              <Table.Cell>{project.closeAt}</Table.Cell>
            </>
          )}
          handleRowClick={handleRowClick}
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