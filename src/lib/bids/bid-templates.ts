/**
 * Professional bid narrative templates
 * Each template transforms Q&A answers into professional bid section content
 */

export type TemplateContext = {
  tenderTitle: string
  companyName?: string
  sector?: string
}

/**
 * Bid section templates
 * Each template is a function: (answers, context) => markdown-formatted narrative
 */
export const BID_TEMPLATES: Record<
  string,
  (answers: Record<string, unknown>, context: TemplateContext) => string
> = {
  executive_summary: (
    answers: Record<string, unknown>,
    context: TemplateContext
  ): string => {
    const overview = (answers.company_overview as string) || ''
    const approach = (answers.proposed_approach as string) || ''

    return `# Executive Summary

${context.companyName || 'Our organization'} is pleased to submit this proposal for ${context.tenderTitle}.

## Company Overview
${overview || 'We are a dedicated organization with a proven track record of delivering high-quality solutions.'}

## Proposed Solution
${approach || 'Our approach prioritizes client collaboration, technical excellence, and measurable outcomes.'}

## Value Proposition
We bring extensive experience in ${context.sector || 'this domain'} with a commitment to delivering exceptional results on time and within budget. Our approach is built on transparency, innovation, and a deep understanding of client needs.`
  },

  technical_approach: (
    answers: Record<string, unknown>,
    context: TemplateContext
  ): string => {
    const technicalAnswer = (answers.technical_approach as string) || ''
    const capability = (answers.capability_match as string) || ''

    return `# Technical Approach

## Overview
${technicalAnswer || 'Our technical methodology combines industry best practices with innovative solutions tailored to your specific requirements.'}

## Capability Alignment
${capability || 'Our team possesses the necessary technical capabilities and expertise to deliver this project successfully.'}

## Technology & Methodology
We propose a robust, scalable approach that prioritizes security, performance, and maintainability. Our technical strategy includes:

- Comprehensive requirements analysis and documentation
- Iterative development with regular stakeholder feedback
- Rigorous testing and quality assurance protocols
- Seamless deployment and knowledge transfer

Our proven processes ensure that technical challenges are identified early and addressed systematically throughout the project lifecycle.`
  },

  methodology: (
    answers: Record<string, unknown>,
    context: TemplateContext
  ): string => {
    const approach = (answers.proposed_approach as string) || ''
    const deliverables = (answers.deliverables_plan as string) || ''

    return `# Methodology & Delivery

## Project Methodology
${approach || 'Our methodology is designed to maximize collaboration, minimize risk, and ensure predictable outcomes. We follow a structured approach that adapts to your specific needs.'}

## Deliverables
${deliverables || 'All project deliverables will be clearly documented, thoroughly tested, and delivered according to the agreed timeline. Each deliverable includes comprehensive documentation and support.'}

## Quality Assurance
Our quality assurance framework includes:
- Regular code reviews and technical audits
- Comprehensive testing at every stage (unit, integration, and acceptance)
- Client review and approval gates at key milestones
- Post-delivery support and continuous optimization

We maintain rigorous standards throughout the project to ensure that every deliverable meets or exceeds expectations.`
  },

  timeline: (
    answers: Record<string, unknown>,
    context: TemplateContext
  ): string => {
    const timelineStr = (answers.timeline as string) || ''

    return `# Project Timeline

## Proposed Duration
${timelineStr || 'We will work with you to establish a timeline that meets your requirements while ensuring quality delivery.'}

## Key Milestones
We propose the following project phases with clearly defined checkpoints:

1. **Discovery & Planning** - Requirements gathering, stakeholder interviews, project planning and scope finalization
2. **Design & Architecture** - Technical specification, architecture design, prototype development and review
3. **Development & Testing** - Iterative development, quality assurance, client feedback integration and refinement
4. **Deployment & Handover** - Production deployment, comprehensive documentation, knowledge transfer, and team training

Each phase includes defined deliverables and client approval checkpoints to ensure continuous alignment with your expectations. We maintain transparent communication throughout, providing regular progress updates and adapting to any changing requirements.`
  },

  experience: (
    answers: Record<string, unknown>,
    context: TemplateContext
  ): string => {
    const relevantExp = (answers.relevant_experience as string) || ''
    const certs = (answers.certifications as string) || ''

    // Format certification status
    let certificationText = ''
    if (certs === 'Yes - We have all required certifications') {
      certificationText =
        'We hold all required certifications specified in the tender requirements.'
    } else if (certs === 'Some - We have some certifications') {
      certificationText =
        'We hold several relevant certifications and are committed to obtaining any additional credentials required for this project.'
    } else if (certs === 'None but willing - We do not have certifications but are willing to obtain them') {
      certificationText =
        'We are committed to obtaining all necessary certifications to meet tender requirements and ensure full compliance.'
    } else if (certs === 'No') {
      certificationText =
        'While we may not hold all specified certifications, our proven track record and technical expertise demonstrate our capability to deliver exceptional results.'
    } else {
      certificationText =
        'We maintain relevant professional certifications and industry credentials.'
    }

    return `# Relevant Experience

## Project Experience
${relevantExp || 'Our team has successfully delivered numerous projects in similar domains, demonstrating consistent expertise and reliability. We bring a deep understanding of industry challenges and proven solutions.'}

## Certifications & Credentials
${certificationText}

## Track Record
Our portfolio demonstrates consistent delivery of high-quality solutions across diverse client engagements. We are committed to maintaining the highest professional standards and continually investing in our team's capabilities.

## References
We are happy to provide detailed case studies and client references upon request.`
  },

  budget: (
    answers: Record<string, unknown>,
    context: TemplateContext
  ): string => {
    const budgetNotes = (answers.budget_notes as string) || ''

    return `# Budget Considerations

${budgetNotes || 'Our pricing approach is transparent, competitive, and designed to deliver maximum value for your investment.'}

## Cost Structure
We provide detailed, itemized pricing that includes:
- All labor and professional services
- Technology and infrastructure costs
- Project management and quality assurance
- Post-delivery support period

Our pricing is structured to provide clarity and predictability, with no hidden fees or unexpected charges. We believe in transparent budgeting that aligns with the value delivered at each project stage.

## Value Delivery
Beyond competitive pricing, we focus on delivering measurable value through efficient processes, proactive risk management, and a commitment to exceeding expectations within the agreed budget parameters.`
  },
}

/**
 * Expand a template with answers and context
 * Returns professional markdown-formatted bid narrative
 */
export function expandTemplate(
  template: (answers: Record<string, unknown>, context: TemplateContext) => string,
  answers: Record<string, unknown>,
  context: TemplateContext
): string {
  return template(answers, context)
}
