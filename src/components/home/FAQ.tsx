import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "Is this real money?",
    answer:
      "No. FairLend is a demonstration platform. All transactions are simulated and stored locally in your browser. No real funds move and no actual loans are issued.",
  },
  {
    question: "How is APR calculated?",
    answer:
      "We normalize all fees (origination, monthly, platform, etc.) and interest into a single Annual Percentage Rate. This includes the cost of borrowing over 365 days, making different offers directly comparable.",
  },
  {
    question: "What is P2P?",
    answer:
      "Peer-to-peer (P2P) lending connects borrowers directly with individual lenders, bypassing traditional banks. In our simulation, you can explore how P2P offers compare to bank loans in terms of cost and structure.",
  },
  {
    question: "Will this affect my credit?",
    answer:
      "No. This is a simulation environment. No real credit checks are performed, no data is sent to credit bureaus, and your actual credit score remains unaffected.",
  },
]

export function FAQ() {
  return (
    <section className="bg-muted/50 py-12 md:py-16">
      <div className="container mx-auto max-w-3xl px-4">
        <h2 className="mb-10 text-center text-3xl font-bold sm:text-4xl">
          Frequently Asked Questions
        </h2>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

