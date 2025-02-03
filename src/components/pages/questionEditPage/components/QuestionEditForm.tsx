// 질문 글 수정

import React, { useEffect, useState, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import ImageTool from "@editorjs/image";
import { useParams } from "next/navigation";
import { Box, Input, Text, Flex, Button, Progress } from "@chakra-ui/react";
import FileAddSection from "@/src/components/common/FileAddSection";
import ProgressStepAddSection from "@/src/components/common/ProgressStepAddSection";
import LinkAddSection from "@/src/components/common/LinkAddSection";
import { readQuestionApi } from "@/src/api/ReadArticle";
import { uploadFileApi } from "@/src/api/RegisterArticle";

// 수정 api 만들고 가져와야함

// import { QuestionArticle } from "@/src/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const progressData = [
  { id: 1, title: "요구사항정의" },
  { id: 2, title: "화면설계" },
  { id: 3, title: "디자인" },
  { id: 4, title: "퍼블리싱" },
  { id: 5, title: "개발" },
  { id: 6, title: "검수" },
];

interface UploadedFilesProps {
  originalName: string;
  saveName: string;
  url: string;
  size: number;
}

interface linkListProps {
  name: string;
  url: string;
}

export default function QuestionEditForm() {
  const { projectId, questionId } = useParams() as {
    projectId: string;
    questionId: string;
  };
  const [title, setTitle] = useState<string>("");
  const editorRef = useRef<EditorJS | null>(null);
  const [linkList, setLinkList] = useState<linkListProps[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFilesProps[]>([]);
  const [uploadedFileSize, setUploadedFileSize] = useState<number[]>([]);


  

  useEffect(() => {
    const loadTask = async () => {
      try {
        const responseData = await readQuestionApi(
          Number(projectId),
          Number(questionId),
        );
        console.log(responseData)
        setTitle(responseData.title);
        setLinkList(responseData.linkList);
        setUploadedFiles(responseData.fileList);

        const parsedContent = typeof responseData.content === "string"
        ? JSON.parse(responseData.content)
        : responseData.content;

        if (!editorRef.current) {
          editorRef.current = new EditorJS({
            holder: "editorjs",
            tools: {
              image: {
                class: ImageTool,
                config: {
                  endpoints: BASE_URL,
                  field: "image",
                  types: "image/*",
                  uploader: {
                    async uploadByFile(file: File) {
                      try {
                        const responseData = await uploadFileApi(file);
                        if (responseData.result !== "SUCCESS") {
                          console.error("파일 업로드 실패");
                          return { success: 0 };
                        }
                        return {
                          success: 1,
                          file: { url: responseData.data.url },
                        };
                      } catch (error) {
                        console.error("파일 업로드 중 오류 발생:", error);
                        return { success: 0 };
                      }
                    },
                  },
                },
              },
            },
            placeholder: "내용을 작성하세요",
          });
        }

        setTimeout(() => {
          editorRef.current?.render({
            blocks: parsedContent.map((block: any) => {
              if (block.type === "paragraph") {
                return {
                  type: "paragraph",
                  data: { text: block.data },
                };
              } else if (block.type === "image") {
                return {
                  type: "image",
                  data: { file: { url: block.data.src } },
                };
              }
              return block;
            }),
          });
        }, 500);
      } catch (error) {
        console.log("에러발생 : ", error);
      }
    };

    loadTask();

    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, [projectId, questionId]);

  return (
    <Flex gap={4} direction={"column"}>
      <Flex gap={4} align={"center"}>
        {/* 제목 입력 */}
        <Box flex={2}>
          <Text mb={2}>제목</Text>
          <Input
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Box>
      </Flex>
      <Box>
        <Text>상세 내용</Text>
        <Box
          id="editorjs"
          border="1px solid #ccc"
          padding="10px"
          borderRadius="5px"
          minHeight="300px"
        ></Box>
      </Box>
      <LinkAddSection linkList={linkList} setLinkList={setLinkList} />

      <FileAddSection
        uploadedFiles={uploadedFiles}
        setUploadedFiles={setUploadedFiles}
        uploadedFileSize={uploadedFileSize}
        setUploadedFileSize={setUploadedFileSize}
      />
    </Flex>
  );
}
