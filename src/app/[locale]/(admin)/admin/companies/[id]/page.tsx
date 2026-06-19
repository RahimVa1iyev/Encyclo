import { getCompanyDetailForReviewAction } from "../actions";
import { notFound } from "next/navigation";
import { CompanyReviewClient } from "./CompanyReviewClient";

export default async function AdminCompanyReviewPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;

  try {
    const data = await getCompanyDetailForReviewAction(id, locale);
    return <CompanyReviewClient data={data} />;
  } catch (error) {
    return notFound();
  }
}
