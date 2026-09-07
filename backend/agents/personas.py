from typing import Dict, Any, List, Optional
import re

# Standard Stopwords for Token Comparison
STOP_WORDS = {
    "a", "an", "the", "and", "or", "in", "on", "at", "to", "for", "of", "with",
    "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
    "do", "does", "did", "can", "could", "would", "should", "will", "what",
    "how", "why", "when", "where", "who", "which", "tell", "me", "about",
    "you", "your", "walk", "through", "describe", "explain", "great", "good",
    "explanation", "going", "deeper", "continuing", "evaluation", "understood",
    "context", "looking", "teamwork", "ownership", "welcome", "thanks", "thank",
    "interview", "point", "proceed", "questions", "share", "today", "cand", "role"
}

def _tokens(text: str) -> set:
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    questions = [
        s.strip() for s in sentences
        if "?" in s or any(s.lower().strip().startswith(w) for w in ["how", "what", "why", "tell", "walk", "describe", "can", "could", "would"])
    ]
    core = " ".join(questions) if questions else text
    cleaned = re.sub(r"[^\w\s]", " ", core.lower())
    return {t for t in cleaned.split() if t not in STOP_WORDS and len(t) > 2}

# Dynamic Company Cultures & Voices
COMPANY_CULTURES: Dict[str, Dict[str, Any]] = {
    "google": {
        "name": "Google",
        "style": "Analytical, system scalability, distributed architectures, algorithm tradeoffs, and high-impact engineering.",
        "eval_focus": "System scale, concurrency, edge cases, latency, and algorithmic complexity.",
        "voice": "allison"
    },
    "amazon": {
        "name": "Amazon",
        "style": "STAR methodology, Customer Obsession, Ownership, Bias for Action, and metric-driven impact.",
        "eval_focus": "Quantified business results, individual ownership, and behavioral leadership principles.",
        "voice": "amber"
    },
    "meta": {
        "name": "Meta",
        "style": "Move fast, pragmatic engineering, product intuition, and handling billions of concurrent users.",
        "eval_focus": "Rapid execution, API performance, product sense, and cross-functional leadership.",
        "voice": "bayou"
    },
    "microsoft": {
        "name": "Microsoft",
        "style": "Collaborative, enterprise reliability, security, cloud architecture, and growth mindset.",
        "eval_focus": "Architectural resilience, backward compatibility, and team collaboration.",
        "voice": "marsh"
    },
    "apple": {
        "name": "Apple",
        "style": "Precision, privacy, user experience, zero-tolerance for bugs, and hardware-software integration.",
        "eval_focus": "Performance optimization, code elegance, and attention to detail.",
        "voice": "allison"
    },
    "openai": {
        "name": "OpenAI",
        "style": "First-principles thinking, transformer architectures, low-latency inference, AI safety, and rapid scaling.",
        "eval_focus": "ML systems, CUDA kernels, token efficiency, evaluation harnesses, and frontier research.",
        "voice": "creek"
    },
    "startup": {
        "name": "YC Startup",
        "style": "Fast-paced, pragmatic problem solving, high agency, 0-to-1 speed, and product-market execution.",
        "eval_focus": "Velocity, scrappiness, user feedback loops, and full-stack ownership.",
        "voice": "creek"
    },
    "default": {
        "name": "Tech Corp",
        "style": "Professional, thorough, structured, and constructive.",
        "eval_focus": "Core domain expertise, clear articulation, and problem-solving methodology.",
        "voice": "allison"
    }
}

# Company-Specific Behavioral Questions
COMPANY_BEHAVIORAL_QUESTIONS: Dict[str, List[str]] = {
    "amazon": [
        "Tell me about a time you showed customer obsession by disagreeing with a team decision that compromised user trust.",
        "Describe a high-stakes project where you had to invent and simplify under tight deadlines with incomplete data.",
        "Can you share an example where you took end-to-end ownership of a major failure and turned it into a systemic fix?"
    ],
    "google": [
        "Tell me about a situation where you had to balance engineering perfection with shipping quickly at scale.",
        "Describe a time you navigated an ambiguous technical requirement with conflicting stakeholder priorities.",
        "How have you actively fostered psychological safety and mentored engineers on your team through complex system outages?"
    ],
    "meta": [
        "Tell me about a time you moved fast and took a calculated risk that significantly accelerated product delivery.",
        "Describe a situation where live telemetry revealed a critical performance bottleneck right after a major launch.",
        "How do you push back against unnecessary architectural complexity when building for hundreds of millions of users?"
    ],
    "openai": [
        "Tell me about a project where standard best practices failed and you had to derive a solution from first principles.",
        "Describe how you approach evaluating reliability and edge-case safety in nondeterministic systems.",
        "Share an experience where you rapidly learned a brand new domain or paradigm to solve a critical bottleneck."
    ],
    "microsoft": [
        "Tell me about a time you collaborated across siloed cross-functional teams to resolve an enterprise security or reliability challenge.",
        "Describe how you handled a situation where a legacy system you maintained needed modernizing without disrupting paying enterprise customers.",
        "Can you share an instance where receiving tough constructive feedback reshaped your engineering approach?"
    ],
    "default": [
        "Describe a time you faced a critical production incident. How did you diagnose, resolve, and prevent recurrence using the STAR method?",
        "Tell me about a technical disagreement you had with a team member and how you reached consensus.",
        "Can you share an example of a project where you exceeded expected business goals through proactive technical leadership?"
    ]
}

# Comprehensive Stage-Based Question Banks by Role & Difficulty
STAGE_QUESTION_BANKS: Dict[str, Dict[str, Any]] = {
    "AI Engineer": {
        "domain_topics": "LLM fine-tuning, RAG pipelines, vector embeddings, latency optimization, agentic workflows, prompt engineering, and model evaluation.",
        "introduction": [
            "To begin, could you give me a brief overview of an end-to-end AI system or RAG application you designed, and what the core architectural goal was?",
            "Welcome! Walk me through your most impactful AI or LLM project and the primary technical challenge you solved.",
            "To kick things off, what motivated your architectural choices in your most recent production AI application?"
        ],
        "technical": {
            "easy": [
                "How do you choose between semantic vector search versus keyword search when building a knowledge retrieval pipeline?",
                "What strategies do you use for chunking large unstructured documents before generating embeddings?",
                "How do you monitor and catch hallucination in model responses before they reach users?"
            ],
            "medium": [
                "How do you handle embedding drift, re-ranking, and context window truncation when serving queries under a 150ms p95 SLA?",
                "Walk me through how you implement multi-agent orchestration with state management and tool-calling validation.",
                "How do you optimize LLM prompt cache hit rates and token efficiency in a high-throughput production service?"
            ],
            "hard": [
                "When serving distributed fine-tuned models, how do you architect continuous batching, speculative decoding, and KV cache paging for peak throughput?",
                "How do you construct automated benchmark harnesses (like LLM-as-a-Judge) that detect subtle semantic regressions with high statistical confidence?",
                "Walk me through your tradeoff analysis between LoRA parameter-efficient fine-tuning versus full fine-tuning on custom domain tokenizers."
            ]
        },
        "behavioral": [
            "Tell me about a time you had to defend an AI model release decision when the accuracy metrics were borderline.",
            "Describe a situation where an AI feature generated unexpected outputs in production. How did you contain and resolve it?",
            "How do you align non-technical product stakeholders on the inherent probabilistic limitations of generative AI?"
        ],
        "closing": [
            "We've covered technical architecture and behavioral execution. Do you have any questions for me about our AI roadmap or engineering culture?",
            "That wraps up our core technical and system rounds. What questions do you have about the team's upcoming initiatives?"
        ]
    },
    "Machine Learning Engineer": {
        "domain_topics": "Model training, PyTorch, feature engineering, distributed training, ML pipelines, drift detection, and inference serving.",
        "introduction": [
            "To start off, could you walk me through a machine learning model you built from training to production, and what problem it solved?",
            "Welcome! Can you summarize the end-to-end ML lifecycle you implemented on your most complex project?",
            "To begin our session, tell me about a machine learning pipeline where you significantly improved predictive accuracy."
        ],
        "technical": {
            "easy": [
                "How do you handle severe class imbalance in your dataset during training and validation?",
                "What metrics do you look at beyond raw accuracy when evaluating model performance on skewed distributions?",
                "How do you prevent data leakage between training, validation, and test splits in time-series data?"
            ],
            "medium": [
                "How do you set up real-time data drift and concept drift monitoring for models serving live traffic?",
                "Walk me through how you optimize inference latency using TensorRT, ONNX runtime, or model pruning.",
                "How do you design feature stores and reproducible feature pipelines for both offline training and online inference?"
            ],
            "hard": [
                "In distributed model training across multiple GPU nodes, how do you troubleshoot network gradient synchronization bottlenecks and optimize pipeline parallelism?",
                "Walk me through how you design an online exploration-exploitation system (like contextual bandits) for real-time recommendation.",
                "How do you implement zero-downtime canary deployments and automated rollback triggers for large neural network models?"
            ]
        },
        "behavioral": [
            "Tell me about a time an ML project you spent weeks on failed to deliver business value. What did you learn?",
            "Describe a situation where product managers wanted quick heuristics while you advocated for a principled ML approach.",
            "How do you prioritize technical debt in feature extraction pipelines against shipping new model iterations?"
        ],
        "closing": [
            "We've completed the technical and leadership sections. What questions do you have for me about our ML infrastructure?",
            "That concludes our technical evaluation. Is there anything about our modeling stack or team you would like to ask?"
        ]
    },
    "Software Engineer": {
        "domain_topics": "Data structures, algorithms, concurrency, microservices, databases, caching, and CI/CD.",
        "introduction": [
            "To begin, could you describe a high-traffic system or complex service you built, and what your specific responsibilities were?",
            "Welcome! Walk me through the architecture of a project where you solved an intricate scalability or reliability challenge.",
            "To get started, tell me about a technically demanding software system you engineered and what made it challenging."
        ],
        "technical": {
            "easy": [
                "How do you determine whether to use an SQL relational database versus a NoSQL key-value or document store?",
                "What techniques do you use to write thread-safe code and avoid race conditions in concurrent applications?",
                "How do you structure comprehensive automated unit and integration tests for microservices?"
            ],
            "medium": [
                "How do you prevent cache stampedes and handle distributed cache invalidation when write volume is high?",
                "Walk me through how you design an idempotent payment or checkout processing API across unreliable network links.",
                "How do you approach database index optimization when slow queries begin impacting p99 response times?"
            ],
            "hard": [
                "How do you architect a distributed key-value store that maintains high availability under network partitions while minimizing split-brain risks?",
                "Walk me through your approach to designing a real-time event streaming pipeline that guarantees exactly-once processing semantics.",
                "How do you troubleshoot a sudden memory leak or goroutine/thread starvation issue under 100,000 requests per second in production?"
            ]
        },
        "behavioral": [
            "Tell me about a time you had to refactor a critical legacy component without causing customer outages.",
            "Describe a situation where you had a disagreement with your tech lead over an architectural choice. How did you resolve it?",
            "Share an example of how you mentored a junior engineer through an intricate technical hurdle."
        ],
        "closing": [
            "We've covered systems design, coding tradeoffs, and team execution. What questions do you have for me about our engineering roadmap?",
            "That brings us to the end of our evaluation rounds. What would you like to know about our engineering culture and day-to-day work?"
        ]
    },
    "Frontend Engineer": {
        "domain_topics": "React/Next.js, state management, WebAudio/WebRTC, Core Web Vitals, performance profiling, and accessible UI architecture.",
        "introduction": [
            "To start off, could you walk me through the architecture of a complex, interactive web application you built?",
            "Welcome! Tell me about a rich frontend user interface you engineered and how you optimized its user experience.",
            "To begin, describe a challenging frontend feature you delivered involving real-time state or multimedia streams."
        ],
        "technical": {
            "easy": [
                "How do you manage client-side state in React to prevent unnecessary re-renders across deep component trees?",
                "What strategies do you use to ensure accessible HTML semantics and full keyboard navigation in custom components?",
                "How do you measure and optimize First Contentful Paint (FCP) and Largest Contentful Paint (LCP)?"
            ],
            "medium": [
                "How do you architect real-time audio visualization with WebAudio API while keeping the main UI thread running at smooth 60 FPS?",
                "Walk me through how you implement optimistic UI updates with automatic rollback on server error.",
                "How do you handle complex client-side caching and offline state synchronization in a Next.js App Router application?"
            ],
            "hard": [
                "How do you architect a micro-frontend architecture with shared design system tokens and isolated bundle loading?",
                "Walk me through how you profile and eliminate memory leaks caused by lingering event listeners, canvas contexts, or WebSocket subscriptions.",
                "How do you design a low-latency WebRTC and WebAudio full-duplex pipeline that dynamically adapts to packet loss and jitter buffers?"
            ]
        },
        "behavioral": [
            "Tell me about a time you had to push back on a designer's mockup because it introduced severe performance bottlenecks.",
            "Describe how you handled a situation where a cross-browser bug only reproduced on specific mobile hardware in production.",
            "How do you balance rapid UI prototyping against maintaining strict design token consistency and code quality?"
        ],
        "closing": [
            "We've covered frontend architecture, performance, and collaboration. Do you have any questions for me about our UI stack?",
            "That concludes our technical rounds. What questions do you have about our design engineering team and product priorities?"
        ]
    },
    "Backend Engineer": {
        "domain_topics": "API design, SQL/NoSQL databases, distributed transactions, message brokers (Kafka/RabbitMQ), and cache invalidation.",
        "introduction": [
            "To begin, could you describe the backend architecture of a high-throughput service you built from scratch or scaled significantly?",
            "Welcome! Walk me through a backend system you engineered that handled demanding concurrency or database load.",
            "To start our session, tell me about an API platform or microservice architecture you designed and its core tradeoffs."
        ],
        "technical": {
            "easy": [
                "What are the key differences between REST, GraphQL, and gRPC, and when would you choose each?",
                "How do database indexes work internally (B-trees vs Hash indexes), and how do you decide which columns to index?",
                "How do you ensure data integrity and prevent SQL injection in backend database queries?"
            ],
            "medium": [
                "How do you implement distributed rate limiting across multiple stateless API gateway instances using Redis?",
                "Walk me through how you design database partitioning and read-replica replication for a write-heavy workload.",
                "How do you handle asynchronous message delivery with dead-letter queues and backpressure management in Kafka or RabbitMQ?"
            ],
            "hard": [
                "How do you design a distributed transaction coordinator across heterogeneous databases using the Saga or Two-Phase Commit pattern?",
                "Walk me through your strategy for live database schema migrations on a billion-row table with zero downtime.",
                "How do you prevent cascading failure cascades across upstream dependencies using circuit breakers and bulkhead isolation?"
            ]
        },
        "behavioral": [
            "Tell me about a time when an unannounced downstream API change broke your production backend. How did you respond?",
            "Describe a situation where you had to choose between shipping a feature fast or re-architecting a fragile database schema.",
            "How do you establish on-call incident review rituals that foster a blameless post-mortem culture?"
        ],
        "closing": [
            "We've completed the backend architecture and reliability evaluation. What questions do you have about our backend infrastructure?",
            "That wraps up our interview session today. What would you like to know about our engineering challenges and distributed scale?"
        ]
    },
    "Product Manager": {
        "domain_topics": "Product strategy, user empathy, prioritization frameworks, North Star metrics, cross-functional roadmapping, and execution.",
        "introduction": [
            "To begin, could you walk me through a product you launched from 0 to 1, and what user problem it solved?",
            "Welcome! Tell me about the most impactful product roadmap you defined and how you validated product-market fit.",
            "To get started, describe a complex product decision where you used data to align divergent engineering and business teams."
        ],
        "technical": {
            "easy": [
                "How do you define and track the primary North Star metric versus guardrail metrics for a new product feature?",
                "What framework (like RICE or Kano) do you use to prioritize feature backlogs under constrained engineering bandwidth?",
                "How do you formulate actionable user personas and user journey maps during the discovery phase?"
            ],
            "medium": [
                "Walk me through how you design an A/B experimentation plan when baseline sample size is low.",
                "How do you evaluate whether a new feature is cannibalizing engagement or revenue from existing product lines?",
                "Tell me how you would design an onboarding experience that maximizes day-30 user retention for a developer tool."
            ],
            "hard": [
                "If our primary competitor launched a feature that threatens 30% of our enterprise market share, how do you formulate our quarterly response?",
                "Walk me through how you price and package a multi-tier SaaS platform balancing expansion revenue and low user churn.",
                "How do you sunset a widely-used legacy product tier while transitioning high-value customers to the modern platform without churn?"
            ]
        },
        "behavioral": [
            "Tell me about a time executive leadership demanded a feature that user research proved was unnecessary. How did you handle it?",
            "Describe a situation where an engineering team missed a critical deadline. How did you realign stakeholders and ship?",
            "Can you share an example of how you navigated a product failure and transformed the learnings into a subsequent win?"
        ],
        "closing": [
            "We've covered product strategy, metrics, and leadership. What questions do you have for me about our product vision and organization?",
            "That concludes our PM interview rounds. What would you like to know about our team culture and strategic goals?"
        ]
    },
    "Data Scientist": {
        "domain_topics": "Statistical modeling, A/B testing, causal inference, SQL, Python, exploratory data analysis, and predictive modeling.",
        "introduction": [
            "To begin, could you describe a statistical or predictive modeling project you led that directly influenced a major business decision?",
            "Welcome! Walk me through your analytical approach on a challenging dataset with noisy or missing data.",
            "To get started, tell me about a data science initiative where your insights contradicted existing company assumptions."
        ],
        "technical": {
            "easy": [
                "What is the difference between Type I and Type II errors in hypothesis testing, and how do you trade them off?",
                "How do you diagnose and address multicollinearity among predictor variables in regression models?",
                "What techniques do you use to validate that an A/B test has reached sufficient statistical power?"
            ],
            "medium": [
                "How do you handle network interference or spillover effects when running A/B experiments in marketplace platforms?",
                "Walk me through how you use causal inference methods (like Difference-in-Differences or Propensity Score Matching) when randomized trials are impossible.",
                "How do you evaluate feature importance and interpretability in complex ensemble models for non-technical stakeholders?"
            ],
            "hard": [
                "How do you design multi-armed bandit algorithms to optimize dynamic pricing or content ranking with non-stationary reward distributions?",
                "Walk me through your methodology for detecting and correcting selection bias in observational customer churn datasets.",
                "How do you build automated anomaly detection systems that flag subtle distributional shifts in high-velocity telemetry streams?"
            ]
        },
        "behavioral": [
            "Tell me about a time a business leader misunderstood a statistical confidence interval. How did you educate and guide them?",
            "Describe a project where you had to make analytical tradeoffs due to aggressive delivery deadlines.",
            "Share an example of how you championed data quality standards across engineering teams that generate raw telemetry."
        ],
        "closing": [
            "We've covered experimental design, modeling, and communication. What questions do you have for me about our data science team?",
            "That wraps up our evaluation session. What would you like to know about our data platform and analytical opportunities?"
        ]
    },
    "default": {
        "domain_topics": "Core engineering principles, system design, scalability, communication, and systematic problem-solving.",
        "introduction": [
            "To begin our session, could you give me an overview of the most technically challenging project you've led recently?",
            "Welcome! Walk me through a complex problem you resolved and the key architectural decisions you made.",
            "To get started, tell me about a project where you delivered significant measurable impact."
        ],
        "technical": {
            "easy": [
                "How do you approach debugging an intermittent issue that only reproduces in production environments?",
                "What is your philosophy on writing clean, self-documenting code versus relying on documentation?",
                "How do you assess and manage technical debt in fast-moving engineering projects?"
            ],
            "medium": [
                "Walk me through the tradeoff analysis between latency, throughput, and cost in your recent architecture.",
                "How do you design automated testing and CI/CD pipelines to ensure rapid, zero-downtime releases?",
                "How do you approach monitoring, alerting, and observability when operating distributed microservices?"
            ],
            "hard": [
                "How do you architect resilient distributed systems that handle regional outages and catastrophic network partitions?",
                "Walk me through how you optimize memory usage, thread synchronization, and CPU cache locality in performance-critical code.",
                "How do you establish engineering standards and architectural review processes for a rapidly scaling engineering team?"
            ]
        },
        "behavioral": [
            "Tell me about a time you made a high-impact technical decision with incomplete information.",
            "Describe a situation where you had to resolve a conflict between cross-functional partners under pressure.",
            "Share an example of how you advocated for code quality and reliability when business priorities pushed for rapid shipping."
        ],
        "closing": [
            "We've covered technical depth and leadership principles. Do you have any questions for me about our engineering roadmap?",
            "That concludes our interview session today. What questions do you have about our team and vision?"
        ]
    }
}

# Backward-compatible alias
ROLE_TEMPLATES = STAGE_QUESTION_BANKS


def get_stage_fallback_question(
    target_role: str,
    target_company: str,
    stage: str,
    difficulty: str,
    asked_questions: List[str]
) -> str:
    """
    Selects the next unasked question for the current stage, role, company, and difficulty.
    Guarantees that a question is never repeated in the session.
    """
    role_key = target_role if target_role in STAGE_QUESTION_BANKS else "default"
    role_bank = STAGE_QUESTION_BANKS[role_key]
    comp_key = target_company.lower() if target_company.lower() in COMPANY_BEHAVIORAL_QUESTIONS else "default"
    diff_key = difficulty.lower() if difficulty.lower() in ["easy", "medium", "hard"] else "medium"

    candidates: List[str] = []

    if stage == "introduction":
        candidates.extend(role_bank.get("introduction", []))
    elif stage == "technical":
        tech_dict = role_bank.get("technical", {})
        candidates.extend(tech_dict.get(diff_key, []))
        # Add questions from other difficulties as backup
        for d in ["medium", "hard", "easy"]:
            if d != diff_key:
                candidates.extend(tech_dict.get(d, []))
    elif stage == "behavioral":
        candidates.extend(COMPANY_BEHAVIORAL_QUESTIONS.get(comp_key, []))
        candidates.extend(role_bank.get("behavioral", []))
    elif stage == "closing":
        candidates.extend(role_bank.get("closing", []))
    else:
        candidates.extend(role_bank.get("technical", {}).get("medium", []))

    # Helper to check if candidate is already in asked_questions
    def is_asked(q: str) -> bool:
        q_tokens = _tokens(q)
        for asked in asked_questions:
            a_tokens = _tokens(asked)
            if not a_tokens or not q_tokens:
                continue
            inter = q_tokens.intersection(a_tokens)
            if len(inter) >= 4 or (len(inter) / max(1, len(q_tokens)) >= 0.55):
                return True
        return False

    # Find first unasked question
    for q in candidates:
        if not is_asked(q):
            return q

    # Fallback contextual question if all pre-defined are exhausted
    if stage == "behavioral":
        return f"Reflecting on your leadership at {target_company}, could you describe a time you took calculated initiative to improve team velocity?"
    elif stage == "technical":
        return f"Taking your last point further, what would be the single most critical architectural bottleneck if our system traffic scaled 100x?"
    elif stage == "closing":
        return f"We have explored your technical depth and leadership style today. What questions do you have for me about our engineering vision at {target_company}?"
    else:
        return f"Could you elaborate on the key technical tradeoffs you navigated during that implementation?"

def generate_system_prompt(
    candidate_name: str,
    target_role: str,
    target_company: str,
    interview_type: str,
    difficulty: str,
    experience_level: str,
    preferred_language: str,
    current_stage: str = "introduction",
    asked_questions: Optional[List[str]] = None,
    turn_count: int = 0
) -> str:
    comp_info = COMPANY_CULTURES.get(target_company.lower(), COMPANY_CULTURES["default"])
    role_key = target_role if target_role in STAGE_QUESTION_BANKS else "default"
    role_info = STAGE_QUESTION_BANKS[role_key]
    asked_list = asked_questions or []

    lang_note = ""
    if preferred_language == "hi":
        lang_note = " Respond conversationally in Hindi."
    elif preferred_language == "hinglish":
        lang_note = " Respond in natural conversational Hinglish (English mixed with Hindi as common in tech teams)."

    stage_instructions = {
        "introduction": "STAGE 1: INTRODUCTION. Welcome the candidate, inquire about their relevant background and high-level architectural experience for this role.",
        "technical": f"STAGE 2: TECHNICAL DEEP DIVE ({difficulty.upper()} DIFFICULTY). Probe into systems, algorithms, scale, tradeoffs, and concrete implementation choices.",
        "behavioral": f"STAGE 3: BEHAVIORAL & STAR ({target_company} CULTURE). Evaluate situational ownership, leadership principles, conflict resolution, and teamwork using Situation-Task-Action-Result.",
        "closing": "STAGE 4: CLOSING & Q&A. Conclude the evaluation. Invite the candidate to ask questions about the team, roadmap, or engineering vision. Wrap up professionally."
    }

    current_instruction = stage_instructions.get(current_stage, stage_instructions["technical"])

    asked_questions_block = ""
    if asked_list:
        formatted_asked = "\n".join([f"- {q}" for q in asked_list[-6:]])
        asked_questions_block = f"\nALREADY ASKED QUESTIONS (STRICTLY DO NOT REPEAT OR RE-ASK ANY OF THESE):\n{formatted_asked}\n"

    prompt = (
        f"You are a Senior Principal Interviewer at {target_company} interviewing {candidate_name} for the position of {target_role} ({experience_level} level). "
        f"Interview Type: {interview_type} | Difficulty: {difficulty.upper()} | Turn: {turn_count} | Stage: {current_stage.upper()}\n"
        f"Company Culture & Style: {comp_info['style']}\n"
        f"Evaluation Focus: {comp_info['eval_focus']}\n"
        f"Domain Topics: {role_info['domain_topics']}\n"
        f"{asked_questions_block}\n"
        f"CURRENT STAGE OBJECTIVE: {current_instruction}\n\n"
        f"CRITICAL CONVERSATIONAL RULES:\n"
        f"1. Keep each spoken response concise (2-3 sentences max) so it sounds like natural human speech.\n"
        f"2. NEVER repeat, rephrase, or loop back to previously asked questions.\n"
        f"3. NEVER restart the interview or re-introduce yourself mid-session.\n"
        f"4. Acknowledge what the candidate just explained, then ask the next progressive question matching the current stage ({current_stage}).\n"
        f"5. If the candidate interrupted to clarify, immediately acknowledge their point and pivot smoothly.\n"
        f"{lang_note}"
    )
    return prompt

def generate_initial_greeting(
    candidate_name: str,
    target_role: str,
    target_company: str,
    interview_type: str,
    difficulty: str = "medium"
) -> str:
    role_key = target_role if target_role in STAGE_QUESTION_BANKS else "default"
    role_bank = STAGE_QUESTION_BANKS[role_key]
    intro_q = role_bank["introduction"][0]
    
    greeting = (
        f"Hi {candidate_name}! Welcome to your {target_company} {interview_type} interview for the {target_role} role. "
        f"{intro_q}"
    )
    return greeting

