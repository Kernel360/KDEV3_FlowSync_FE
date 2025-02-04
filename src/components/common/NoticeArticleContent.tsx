// 외부 라이브러리
import { Box, Text, Image, VStack } from "@chakra-ui/react";

// 절대 경로 파일
import {
  QuestionArticle,
  TaskArticle,
  ArticleLink,
  ArticleFile,
  ContentBlock,
  NoticeArticle,
} from "@/src/types";
import { formatDateWithTime } from "@/src/utils/formatDateUtil";

interface ArticleContentProps<
  T extends QuestionArticle | TaskArticle | NoticeArticle,
> {
  article: T | null;
}

export default function ArticleContent<
  T extends QuestionArticle | TaskArticle | NoticeArticle,
>({ article }: ArticleContentProps<T>) {
  if (!article) {
    return (
      <Box>
        <Text>게시물을 불러올 수 없습니다</Text>
      </Box>
    );
  }

  const parsedContent =
    typeof article.content === "string"
      ? JSON.parse(article.content)
      : article.content;

  // console.log(parsedContent[0])

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
      return null;
    });
  };

  // 링크 렌더링
  const renderLinks = (links: ArticleLink[]) => {
    return links.map((link, index) => {
      const url =
        link.url.startsWith("http://") || link.url.startsWith("https://")
          ? link.url
          : `https://${link.url}`;

      return (
        <Box
          key={index}
          mb={2}
          cursor="pointer"
          color={"blue"}
          onClick={() => window.open(url, "_blank")}
          _hover={{ textDecoration: "underline" }}
        >
          <Text fontWeight="normal">{link.name}</Text>
        </Box>
      );
    });
  };

  // 첨부파일 렌더링
  const renderFiles = (files: ArticleFile[]) => {
    return files.map((file, index) => {
      const fileName = file.originalName;
      return (
        <Box key={index} mb={4}>
          <a
            href={file.url}
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

  return (
    <Box mb={4}>
      {/* 제목 */}
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
        {article.title}
      </Text>

      {/* 작성자, 작성 일시 (NoticeArticle인 경우 작성자 정보 숨김) */}
      <Box mb={4}>
        {"author" in article && <Text>작성자: {article.author}</Text>}
        <Text>{formatDateWithTime(article.regAt)}</Text>
      </Box>

      {/* 본문 내용 */}
      <Box mb={4}>{renderContent(parsedContent)}</Box>
    </Box>
  );
}
