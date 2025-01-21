import { Box, Text } from "@chakra-ui/react";

interface StatusTagProps {
  children: string;
}
// 종합 대시보드와 프로젝트 대시보드에 컬럼의 디자인을 위해 쓰이는 박스
export default function StatusTag({ children }: StatusTagProps) {
  const color = children === "진행중" ? "#21A366" : "#505050";
  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Box
        display="flex"
        backgroundColor="#F9F9F9"
        paddingX="8px"
        paddingY="4px"
        justifyContent="center"
        alignItems="center"
        borderRadius="6px"
        color={color}
        fontSize="14px"
        fontWeight="500"
        letterSpacing="-0.28px"
        width="110px"
        height="35px"
      >
        <Text textStyle="lg">{children}</Text>
      </Box>
    </Box>
  );
}