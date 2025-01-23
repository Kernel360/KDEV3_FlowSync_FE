import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchMemberList as fetchMembers } from "@/src/api/members";
import {
  CommonResponseType,
  MemberProps,
  MemberListResponse,
  PaginationProps,
} from "@/src/types";

/**
 * 회원 목록 데이터를 관리하는 커스텀 훅
 */
export function useMemberList() {
  const [memberList, setMemberList] = useState<MemberProps[]>([]);
  const [loading, setLoading] = useState(false);

  const [paginationMeta, setPaginationMeta] = useState<PaginationProps>();

  const searchParams = useSearchParams();
  const keyword = searchParams?.get("keyword") || "";
  const filter = searchParams?.get("filter") || "";

  /**
   * 회원 목록 데이터를 가져오는 함수
   * @param {number} currentPage - 현재 페이지 번호 (기본값: 1)
   * @param {number} pageSize - 한 페이지당 항목 수 (기본값: 10)
   */
  const fetchMemberList = useCallback(
    async (currentPage: number = 1, pageSize: number = 10) => {
      setLoading(true);
      try {
        const response: CommonResponseType<MemberListResponse> =
          await fetchMembers(keyword, filter, currentPage, pageSize);
        setMemberList(response.data.members);
        setPaginationMeta(response.data.meta);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    },
    [keyword, filter],
  );

  useEffect(() => {
    fetchMemberList();
    console.log("시작할 때 딱 1번만 실행");
  }, [fetchMemberList]);

  console.log("memberList: ", memberList);
  return {
    keyword,
    filter,
    memberList,
    paginationMeta,
    loading,
    fetchMemberList,
  };
}
