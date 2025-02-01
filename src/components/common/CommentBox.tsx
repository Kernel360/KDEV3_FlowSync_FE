import { Button, Textarea, Box } from "@chakra-ui/react";
import React, { useState } from "react";
import { registerComment } from "@/src/api/registerComment";
import { useParams } from "next/navigation";


interface CommentBoxProps {
  setCommentIsWritten: React.Dispatch<React.SetStateAction<boolean>>
}

export default function CommentBox({setCommentIsWritten}: CommentBoxProps) {
  const { projectId, questionId } = useParams();

  const [commentText, setCommentText] = useState<string>("");

  const handleSave = async () => {
    try {
      const requestData = { content: commentText };

      const responseData = await registerComment(
        Number(projectId),
        Number(questionId),
        requestData,
      );
      if (responseData.result === "SUCCESS") {
        console.log(responseData.result)
        setCommentIsWritten((prev: boolean) => !prev);
      }

    } catch (error) {
      console.log("댓글 등록 실패 : ", error);
    }
  };

  return (
    <Box>
      <Textarea
        placeholder="댓글을 입력하세요."
        onChange={(e) => setCommentText(e.target.value)}
      />
      <Button mt={2} colorScheme="blue" onClick={handleSave}>
        댓글 작성
      </Button>
    </Box>
  );
}
