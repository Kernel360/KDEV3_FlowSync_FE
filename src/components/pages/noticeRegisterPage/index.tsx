"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box } from "@chakra-ui/react";
import BackButton from "@/src/components/common/BackButton";
import { NoticeRequestData } from "@/src/types";
import { createNoticeApi } from "@/src/api/notices";
import ArticleForm from "@/src/components/common/ArticleForm";
import SelectInput from "@/src/components/common/FormSelectInput";

const categoryData = [
  { id: 1, title: "서비스업데이트", value: "SERVICE_UPDATE" },
  { id: 2, title: "정책변경", value: "POLICY_CHANGE" },
  { id: 3, title: "점검안내", value: "MAINTENANCE" },
  { id: 4, title: "기타", value: "OTHER" },
];
const priorityData = [
  { id: 1, title: "긴급", value: "EMERGENCY" },
  { id: 2, title: "일반", value: "NORMAL" },
];

export default function NoticeRegisterPage() {
  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [priority, setPriority] = useState<string>("");
  const router = useRouter();

  const handleSave = async <T extends NoticeRequestData>(requestData: T) => {
    try {
      const response = await createNoticeApi({
        ...requestData,
        ...(requestData.category !== undefined
          ? { category: requestData.category }
          : {}),
        ...(requestData.priority !== undefined
          ? { priority: requestData.priority }
          : {}),
      });
      alert("저장이 완료되었습니다.");
      router.push(`/notices`);
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장 중 문제가 발생했습니다.");
    }
  };

  return (
    <Box
      maxW="1000px"
      w={"100%"}
      mx="auto"
      mt={10}
      p={6}
      borderWidth={1}
      borderRadius="lg"
      boxShadow="md"
    >
      <BackButton />
      <ArticleForm title={title} setTitle={setTitle} handleSave={handleSave}>
        {/* 우선순위 선택 */}
        <SelectInput
          label="우선순위"
          selectedValue={priority}
          setSelectedValue={setPriority}
          options={priorityData}
        />

        {/* 카테고리 선택 */}
        <SelectInput
          label="카테고리"
          selectedValue={category}
          setSelectedValue={setCategory}
          options={categoryData}
        />
      </ArticleForm>
    </Box>
  );
}
