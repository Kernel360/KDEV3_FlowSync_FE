// 외부 라이브러리
import { Box, Text, Image, VStack } from "@chakra-ui/react";

// 절대 경로 파일
import { Task, ContentBlock } from "@/src/types";
interface TaskContentProps {
  task: Task;
}

export default function TaskContent({ task }: TaskContentProps) {
  // 본문 렌더링
  const renderContent = (content: ContentBlock[]) => {
    return content.map((block, index) => {
      // paragraph 데이터

      if (block.type === "paragraph" && typeof block.data === "string") {
        return (
          <Text key={index} mb={4} whiteSpace="pre-line">
            {block.data}
          </Text>
        );
      }

      // image 데이터

      if (block.type === "image" && typeof block.data === "object") {
        return (
          <Box key={index} mb={4}>
            <Image
              src={block.data.src}
              alt="대체 텍스트"
              borderRadius="md"
              mb={2}
            />
          </Box>
        );
      }

      return null; // 예상치 못한 데이터 타입 처리
    });
  };

  // 링크 렌더링
  const renderLinks = (links: Task["taskBoardLinkList"]) => {
    return links.map((link, index) => (
      <Box
        key={index}
        mb={2}
        cursor="pointer"
        color={"blue"}
        onClick={() => window.open(link.url, "_blank")}
        _hover={{ textDecoration: "underline" }}
      >
        <Text fontWeight="normal">{link.name}</Text>
      </Box>
    ));
  };

  // 첨부파일 렌더링
  const renderFiles = (files: string[]) => {
    if (!Array.isArray(files)) {
      console.error("files is not an array:", files);
      return null;
    }

    return files.map((file: string, index: number) => {
      const fileName = file.split("/").pop(); // 파일 이름 추출
      return (
        <Box key={index} mb={4}>
          <a
            href={file}
            target="blank"
            download={fileName}
            style={{
              color: "blue",
              textDecoration: "none",
              cursor: "pointer",
              fontWeight: "normal",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.textDecoration = "underline")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.textDecoration = "none")
            }
          >
            {fileName}
          </a>
        </Box>
      );
    });
  };

  // regAt 날짜 예쁘게 변환
  // 연도.월.일 시:분 형태로 반환
  function formatDateString(dateString: string) {
    const date = new Date(dateString); // Date 객체 생성

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}.${month}.${day} ${hours}:${minutes}`;
  }

  return (
    <Box mb={4}>
      {/* 제목 */}
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
        {task.title}
      </Text>

      {/* 작성자, 작성 일시 */}
      <Box mb={4}>
        <Text>작성자: {task.author}</Text>
        <Text>{formatDateString(task.regAt)}</Text>
      </Box>

      {/* 본문 내용 */}
      <Box mb={4}>{renderContent(task.content)}</Box>
      <br />
      <br />
      {/* 첨부 링크 */}
      <Box>
        <Text fontWeight="bold" mb={2}>
          첨부 링크
          <VStack align="start">{renderLinks(task.taskBoardLinkList)}</VStack>
        </Text>
      </Box>
      <br />
      <br />
      {/* 첨부 파일 */}
      <Box mb={4}>
        <Text fontWeight="bold" mb={2}>
          첨부 파일
        </Text>
        <VStack align="start">{renderFiles(task.file)}</VStack>
      </Box>
    </Box>
  );
}
