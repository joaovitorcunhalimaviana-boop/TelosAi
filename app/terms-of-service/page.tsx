import { generateTermsHTML } from "@/lib/terms-of-service"

export default function TermsOfServicePage() {
  const termsHTML = generateTermsHTML()

  return (
    <div className="container mx-auto py-8 px-4">
      <div dangerouslySetInnerHTML={{ __html: termsHTML }} />
    </div>
  )
}
