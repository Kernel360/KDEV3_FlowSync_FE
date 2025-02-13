import { Box, Flex } from "@chakra-ui/react";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* 로그인 페이지 중앙 정렬 레이아웃 */}
      <Flex
        direction="column"
        align="center"
        justify="center"
        minHeight="100vh"
        backgroundColor="gray.50"
        overflow="hidden" // 스크롤 제거
      >
        <Box
          width="100%"
          maxW="500px"
          borderRadius="md"
          bg="white"
          boxShadow="lg"
        >
          {children}
        </Box>
      </Flex>
    </>
  );
}
