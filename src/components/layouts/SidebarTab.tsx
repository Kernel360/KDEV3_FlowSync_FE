import { Box, CardBody, CardRoot, CardTitle } from "@chakra-ui/react";
import Data from "@/src/data/projects_mock_data.json";
import Link from "next/link";
import { useSidebar } from "@/src/context/SidebarContext";

interface SidebarTabProps {
  memberRole: "admin" | "member";
}

// admin 메뉴 항목
const adminMenuItems = [
  { value: "/", title: "홈 대시보드" },
  { value: "/admin/members", title: "회원 관리" },
  { value: "/admin/organizations", title: "업체 관리" },
];

export default function SidebarTab({ memberRole }: SidebarTabProps) {
  const { projectStatus } = useSidebar();

  // 일반 user 메뉴 항목 (프로젝트 진행 상태에 따른 데이터 필터링 -> 각각 최대 5개)
  const userMenuItems = Data.data
    .filter((item) =>
      projectStatus === "완료 프로젝트"
        ? item.projectStatus === "납품완료"
        : item.projectStatus === "진행중",
    )
    .slice(0, 5);

  // 조건에 따라 메뉴 항목 생성
  const menuItems =
    memberRole === "admin"
      ? adminMenuItems.map((item) => (
          <CardTitle key={item.value} width="100%" mb="2" p="2">
            <Link href={`${item.value}`}>{item.title}</Link>
          </CardTitle>
        ))
      : userMenuItems.map((item) => (
          <CardTitle key={item.id} mb="2" p="1">
            <Link href={`/projects/${item.id}/tasks`}>{item.projectName}</Link>
          </CardTitle>
        ));

  return (
    <Box bg="gray.200">
      <CardRoot>
        <CardBody>{menuItems}</CardBody>
      </CardRoot>
    </Box>
  );
}
