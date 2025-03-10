"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Text } from "@chakra-ui/react";
import { login } from "@/src/api/auth";
import { useForm } from "@/src/hook/useForm";
import InputForm from "@/src/components/common/InputForm";
import { defaultValuesOfLogin } from "@/src/constants/defaultValues";
import { validationRulesOfLogin } from "@/src/constants/validationRules";
import styles from "@/src/components/pages/LoginPage/Login.module.css";
import Image from "next/image";

export const GUIDE_MESSAGE = `
  본 애플리케이션은 B2B 기업 회원 전용 서비스로 기획되었습니다. 테스트를 위한 계정 정보를 안내 드립니다.

  - 일반 사용자
  (개발사) ID: dahye.jung@smartdesign.com / PW: test123!

  (고객사) ID: minsu.kim@digitalbridge.com  / PW: test123!
  
  - 시스템 관리자
  (관리사) )ID: admin@flowsync.com / PW: 1111`;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const route = useRouter();
  const { inputValues, inputErrors, handleInputChange, checkAllInputs } =
    useForm(defaultValuesOfLogin, validationRulesOfLogin);

  function validateLoginInputs() {
    if (!checkAllInputs()) {
      alert("입력값을 확인하세요.");
      return false;
    }
    // 공백 입력 시 경고 메시지 출력
    if (inputValues.email.includes(" ") || inputValues.password.includes(" ")) {
      alert("이메일 및 비밀번호에는 공백을 포함할 수 없습니다.");
      return false;
    }
    return true;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return; // 이미 로딩 중이라면 요청 중단
    if (!validateLoginInputs()) return;

    setIsSubmitting(true);

    try {
      await login(inputValues.email, inputValues.password);
      route.push("/");
    } catch (error) {
      // "로그인 실패:"
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box className={styles.loginContainer}>
      {/* 로그인 카드 */}
      <Box className={styles.loginCard}>
        {/* 로그인 헤더 */}
        <Box className={styles.loginHeader}>
          <Box className={styles.loginLogo}>
            <Image
              src="/logo.png" // public 디렉토리의 로고 파일 경로
              alt="FlowSync"
              width={35} // 원하는 크기로 설정
              height={35}
              priority
            />
            <Text className={styles.loginLogoName}>FlowSync</Text>
          </Box>
          <Text className={styles.loginTitle}>
            기업 회원 전용 페이지에 오신 것을 환영합니다!
          </Text>
        </Box>
        {/* 가이드 메시지 */}
        <Box className={styles.guideMessage} height="13rem">
          <Text color="var(--text-light)" whiteSpace="pre-line">
            {GUIDE_MESSAGE}
          </Text>
        </Box>
        <form onSubmit={handleSubmit}>
          <Box className={styles.inputFieldContainer}>
            <Box className={styles.inputWithButton}>
              <InputForm
                id="email"
                type="email"
                label="Email Address"
                placeholder="이메일을 입력하세요."
                value={inputValues.email}
                error={inputErrors.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </Box>
            <InputForm
              id="password"
              type="password"
              label="Password"
              placeholder="패스워드를 입력하세요."
              value={inputValues.password}
              error={inputErrors.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
            />
            <Box className={styles.loginButtonContainer}>
              <Button
                type="submit"
                className={styles.loginButton}
                _disabled={{
                  cursor: "not-allowed",
                }}
                loading={isLoading}
                disabled={isSubmitting}
              >
                {isLoading ? "로딩 중..." : "로그인"}
              </Button>
            </Box>
          </Box>
        </form>
      </Box>
    </Box>
  );
}
