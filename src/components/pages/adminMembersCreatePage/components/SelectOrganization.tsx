// 회사만 선택하는 컴포넌트

import { Flex, Box, Text, Button } from "@chakra-ui/react";
import React from "react";

interface OrgProps {
  id: number;
  type: string;
  brNumber: string;
  name: string;
  brCertificateUrl: string;
  streetAddress: string;
  detailAddress: string;
  phoneNumber: string;
  status: string;
}

interface SelectedOrganizationProps {
  organizations: OrgProps[];
  selectedOrganization?: OrgProps;
  setSelectedOrganization: React.Dispatch<
    React.SetStateAction<OrgProps | undefined>
  >;
}

export default function SelectedOrganization({
  organizations,
  selectedOrganization,
  setSelectedOrganization,
}: SelectedOrganizationProps) {

  return (
    <Flex minWidth={"700px"}>
              <Flex direction={"column"} mr={5} mb={8}>
                <Box
                  h={"400px"}
                  w={"250px"}
                  overflowY={"auto"}
                  border="1px solid #ccc"
                  borderRadius="8px"
                  p="4"
                >
                  {organizations.length > 0 ? (
                    organizations.map((org) => (
                      <Box
                        key={org.id}
                        p="3"
                        borderRadius={"md"}
                        bg={selectedOrgId === org.id ? "blue.500" : ""}
                        color={selectedOrgId === org.id ? "white" : "black"}
                        cursor="pointer"
                        mb="2"
                        _hover={{ bg: "blue.200", color: "white" }}
                        onClick={() => setSelectedOrgId(org.id)}
                      >
                        <Text>{org.name}</Text>
                      </Box>
                    ))
                  ) : (
                    <Text>조회된 회사가 없습니다.</Text>
                  )}
                </Box>
              </Flex>
    </Flex>
  );
}
