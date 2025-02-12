"use client";

import { useParams } from "next/navigation";
import { ProjectLayout } from "@/src/components/layouts/ProjectLayout";
import ProjectsManagementStepCards from "@/src/components/pages/ProjectWorkFlowPage/components/ProjectManagementStepCards";
import { ProjectInfoProvider } from "@/src/context/ProjectInfoContext";

export default function ProjectWorkFlowPage() {
  const { projectId } = useParams();
  return (
    <ProjectInfoProvider projectId={projectId as string}>
      <ProjectLayout>
        <ProjectsManagementStepCards title={"관리 단계 변경"} />
      </ProjectLayout>
    </ProjectInfoProvider>
  );
}
