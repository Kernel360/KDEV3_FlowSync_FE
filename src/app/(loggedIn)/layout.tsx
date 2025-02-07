"use client";

import { ReactNode, useEffect, useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { useColorModeValue } from "@/src/components/ui/color-mode";
import Header from "@/src/components/layouts/Header";
import Sidebar from "@/src/components/layouts/Sidebar";
import { SidebarProvider } from "@/src/context/SidebarContext";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [colorMode, setColorMode] = useState("white");
  const [isLoaded, setIsLoaded] = useState(false);

  // 다크모드 색상 설정
  const bgColor = useColorModeValue("white", "gray.800"); // 전체 배경색
  const marginBgColor = useColorModeValue("white", "gray.900"); // 마진 영역 배경색

  useEffect(() => {
    const savedTheme = localStorage.getItem("chakra-ui-color-mode");
    if (savedTheme) {
      setColorMode(savedTheme);
    }
    setIsLoaded(true);
  }, [setColorMode]);

  if (!isLoaded) return null; // 로딩 상태 추가

  return (
    <SidebarProvider>
      <Flex
        direction="column"
        minHeight="100vh"
        bg={bgColor}
        transition="background-color 0.3s"
      >
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <Flex
          direction="row"
          height="calc(100vh - var(--header-height))"
          bg={marginBgColor} // 마진 영역의 배경색 설정
        >
          {/* Sidebar 영역 */}
          <Box
            width={isSidebarOpen ? "18%" : "0"}
            transition="width 0.3s ease"
            overflowY="auto"
            bg={bgColor}
          >
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
          </Box>

          {/* Main Content */}
          <Box
            flex={1}
            bg={marginBgColor} // 마진 영역의 배경색 설정
            marginTop="2%"
            marginX={isSidebarOpen ? "2%" : "10%"}
            transition="margin 0.3s ease-in-out"
            borderRadius="lg" // 둥근 모서리 추가 (선택 사항)
            padding={4}
          >
            <Flex
              as="main"
              flex={isSidebarOpen ? "82%" : "1"} // 나머지 공간 비율로 설정
              justify="center"
              align="flex-start"
              overflowY="auto"
              // padding={4}
              bg={bgColor}
              transition="flex-basis 0.3s ease"
            >
              <Box
                width="100%"
                maxWidth="var(--content-max-width)"
                bg={bgColor}
              >
                {children}
              </Box>
            </Flex>
          </Box>
        </Flex>
      </Flex>
    </SidebarProvider>
  );
}
