"use client";

import { useEffect, useState } from "react";
import { Flex } from "@chakra-ui/react";
import ProgressStepButton from "@/src/components/common/ProgressStepButton";
import { Loading } from "@/src/components/common/Loading";
import { ProjectProgressStepProps } from "@/src/types";

interface ProgressStepSectionProps {
  progressStep: ProjectProgressStepProps[];
  loading: boolean;
}

/**
 * ProgressStepSection 컴포넌트
 */
export default function ProgressStepSection({
  progressStep,
  loading,
}: ProgressStepSectionProps) {
  // 현재 선택된 버튼 id 상태 (기본값은 progressData의 첫 번째 항목)
  const [selectedButtonId, setSelectedButtonId] = useState<string>(
    progressStep.length > 0 ? progressStep[0].id : "",
  );

  useEffect(() => {
    if (progressStep.length > 0 && !selectedButtonId) {
      setSelectedButtonId(progressStep[0].id);
    }
  }, [progressStep]);

  const handleStatusChange = (id: string) => {
    // 이미 선택된 버튼이라면 아무 동작도 하지 않음
    if (id === selectedButtonId) {
      return;
    }

    setSelectedButtonId(id); // 클릭된 버튼으로 상태 변경

    // progressData에서 선택된 단계의 value를 찾음
    const selectedValue = progressStep.find((item) => item.id === id)?.id || "";

    // URL 쿼리 파라미터를 수정 (progressStep 값 변경)
    const params = new URLSearchParams(window.location.search);
    params.set("progressStepId", selectedValue);

    // 브라우저 히스토리(주소)를 업데이트
    history.replaceState(null, "", `?${params.toString()}`); // URL 업데이트
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <Flex
      marginY="0.5rem"
      marginX="1.3rem"
      alignItems="center"
      padding="1rem"
      gap="1.5rem"
      flexWrap="nowrap"
      overflowX="auto"
      touchAction="pan-x"
      css={{
        "&::-webkit-scrollbar": {
          width: "2.5px",
          height: "10px",
        },
        "&::-webkit-scrollbar-track": {
          width: "2px",
        },
        "&::-webkit-scrollbar-thumb": {
          borderRadius: "5px",
          transition: "all 1s ease-in-out",
        },
        "&:hover::-webkit-scrollbar-thumb": {
          background: "gray.100",
        },
      }}
    >
      {/*
        progressStep 배열을 순회하며 ProgressStepButton을 렌더링
        - text: 단계명 (예: "요구사항정의")
        - count: 현재 단계 개수
        - isSelected: 현재 선택 상태 여부
        - onClick: 클릭 시 handleStatusChange 실행
      */}
      {progressStep.map((progress) => (
        <ProgressStepButton
          key={progress.id}
          text={progress.title}
          color={progress.color}
          description={progress.description}
          count={progress.count || 0} // 서버에서 받아온 개수 표시
          isSelected={selectedButtonId === progress.id} // 선택 상태 전달
          onClick={() => handleStatusChange(progress.id)} // 선택된 버튼이면 ProgressStepButton 내부에서 클릭 방지
        />
      ))}
    </Flex>
  );
}
