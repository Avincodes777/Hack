const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Enhanced docs database with categories and metadata
const docs = [
  // HR Policies
  { 
    id: 1,
    title: "Leave Policy", 
    category: "HR",
    tags: ["vacation", "sick", "time off", "PTO"],
    snippet: "Employees are entitled to 20 paid leaves per year. Sick leave: 10 days. Maternity leave: 6 months.",
    content: "Annual leave allocation: 20 days per year. Sick leave: 10 days annually. Emergency leave: 3 days. Maternity/Paternity: 6 months paid. Leave requests must be submitted 2 weeks in advance.",
    lastUpdated: "2025-01-15",
    popularity: 95
  },
  { 
    id: 2,
    title: "Work From Home Policy", 
    category: "HR",
    tags: ["remote", "wfh", "hybrid", "flexible work"],
    snippet: "Work from home allowed 2 days per week. Must maintain productivity standards.",
    content: "Hybrid work model: 2 days WFH per week. Home office requirements: stable internet, quiet workspace. Daily standup required. Equipment provided by company.",
    lastUpdated: "2025-01-10",
    popularity: 88
  },
  { 
    id: 3,
    title: "Salary Structure & Benefits", 
    category: "HR",
    tags: ["compensation", "salary", "benefits", "insurance"],
    snippet: "Performance reviews in March & September. Health insurance covers family.",
    content: "Bi-annual performance reviews. Merit increases based on performance. Health insurance: family coverage included. Dental and vision available. 401k matching: 6%.",
    lastUpdated: "2025-01-01",
    popularity: 92
  },

  // IT Policies
  { 
    id: 4,
    title: "IT Security Policy", 
    category: "IT",
    tags: ["security", "password", "2fa", "cybersecurity"],
    snippet: "Password must be changed every 90 days. 2FA required for all systems.",
    content: "Strong password requirements: 12+ characters, mixed case, numbers, symbols. 2FA mandatory. VPN required for remote access. No personal software without approval.",
    lastUpdated: "2024-12-20",
    popularity: 76
  },
  { 
    id: 5,
    title: "Software Installation Guidelines", 
    category: "IT",
    tags: ["software", "installation", "approval", "licensing"],
    snippet: "All software must be approved by IT. Submit requests via ServiceNow.",
    content: "Software approval process: Submit request via ServiceNow. Security scan required. License tracking mandatory. Prohibited software list available on intranet.",
    lastUpdated: "2024-12-15",
    popularity: 64
  },

  // Finance
  { 
    id: 6,
    title: "Expense Reimbursement", 
    category: "Finance",
    tags: ["expenses", "travel", "reimbursement", "receipts"],
    snippet: "Submit expenses within 7 days of travel. Receipts required for amounts over $25.",
    content: "Expense submission: Within 7 days. Receipt requirements: $25+. Approved categories: travel, meals, office supplies. Processing time: 5-7 business days.",
    lastUpdated: "2025-01-05",
    popularity: 82
  },

  // Customer Service
  { 
    id: 7,
    title: "Refund Policy", 
    category: "Customer Service",
    tags: ["refund", "return", "customer", "policy","What is the refund policy","What's the refund policy "],
    snippet: "Customers can request a refund within 30 days. Digital products: 7 days.",
    content: "Physical products: 30-day return window. Digital products: 7-day return. Refund processing: 3-5 business days. Original receipt required. Restocking fee may apply.",
    lastUpdated: "2024-12-30",
    popularity: 71
  },
  { 
    id: 8,
    title: "Customer Support SLA", 
    category: "Customer Service",
    tags: ["support", "sla", "response time", "escalation"],
    snippet: "Response time: 4 hours for urgent, 24 hours for standard tickets.",
    content: "SLA commitments: Urgent - 4 hours, High - 8 hours, Standard - 24 hours, Low - 72 hours. Escalation procedures defined. Customer satisfaction tracking.",
    lastUpdated: "2024-12-25",
    popularity: 58
  },

  // General
  { 
    id: 9,
    title: "Company Holidays 2025", 
    category: "General",
    tags: ["holidays", "calendar", "time off", "schedule"],
    snippet: "New Year, Memorial Day, Independence Day, Labor Day, Thanksgiving, Christmas.",
    content: "2025 Holidays: New Year's Day, Martin Luther King Day, Presidents Day, Memorial Day, Independence Day, Labor Day, Columbus Day, Veterans Day, Thanksgiving, Black Friday, Christmas Eve, Christmas Day.",
    lastUpdated: "2024-12-01",
    popularity: 89
  },
  { 
    id: 10,
    title: "Code of Conduct", 
    category: "HR",
    tags: ["conduct", "ethics", "behavior", "harassment"],
    snippet: "Professional behavior, harassment policy, reporting procedures.",
    content: "Ethical standards: respect, integrity, accountability. Zero tolerance for harassment. Reporting mechanisms: HR, anonymous hotline, management chain.",
    lastUpdated: "2024-11-15",
    popularity: 67
  }
];

// Search analytics
let searchAnalytics = {
  totalSearches: 0,
  popularTerms: {},
  recentSearches: []
};

const app = express();
app.use(cors({ 
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"], 
  allowedHeaders: ["Content-Type", "Authorization"] 
}));
app.use(express.json());
app.use(express.static("."));

// Enhanced search function
function searchDocs(query, options = {}) {
  const searchTerm = query.toLowerCase().trim();
  
  // Track analytics
  searchAnalytics.totalSearches++;
  searchAnalytics.popularTerms[searchTerm] = (searchAnalytics.popularTerms[searchTerm] || 0) + 1;
  searchAnalytics.recentSearches.unshift({ 
    term: searchTerm, 
    timestamp: new Date().toISOString() 
  });
  searchAnalytics.recentSearches = searchAnalytics.recentSearches.slice(0, 10);

  let results = [];

  // Exact title matches (highest priority)
  const exactMatches = docs.filter(d => 
    d.title.toLowerCase() === searchTerm
  );

  // Title contains search term (high priority)
  const titleMatches = docs.filter(d => 
    d.title.toLowerCase().includes(searchTerm) && 
    !exactMatches.includes(d)
  );

  // Tag matches (medium-high priority)
  const tagMatches = docs.filter(d => 
    d.tags && d.tags.some(tag => tag.toLowerCase().includes(searchTerm)) &&
    !exactMatches.includes(d) && !titleMatches.includes(d)
  );

  // Category matches (medium priority)
  const categoryMatches = docs.filter(d => 
    d.category && d.category.toLowerCase().includes(searchTerm) &&
    !exactMatches.includes(d) && !titleMatches.includes(d) && !tagMatches.includes(d)
  );

  // Content/snippet matches (lower priority)
  const contentMatches = docs.filter(d => 
    (d.snippet.toLowerCase().includes(searchTerm) || 
     (d.content && d.content.toLowerCase().includes(searchTerm))) &&
    !exactMatches.includes(d) && !titleMatches.includes(d) && 
    !tagMatches.includes(d) && !categoryMatches.includes(d)
  );

  results = [...exactMatches, ...titleMatches, ...tagMatches, ...categoryMatches, ...contentMatches];

  // Sort by popularity within each category
  results.sort((a, b) => b.popularity - a.popularity);

  return results;
}

// Main search endpoint
app.post("/ask", async (req, res) => {
  try {
    const query = (req.body.query || "").toLowerCase().trim();
    if (!query) {
      return res.status(400).json({ answer: "⚠️ Please enter a search query." });
    }

    // Handle special help and support commands
    if (query.includes("help") || query.includes("support")) {
      const helpResponse = `
🆘 **InfoLens Help Center**

**How to search:**
• Type keywords like "leave", "refund", "expenses"
• Use the sidebar buttons for quick access
• Try the search bar at the top

**Available topics:**
• 📋 Leave Policy - vacation and sick leave info
• 💰 Refund Policy - customer refund procedures  
• 🏠 WFH Policy - work from home guidelines
• 💳 Expense Reimbursement - expense submission process

**Quick commands:**
• "Show all docs" - list all documents
• "Show policies" - filter policy documents
• "Contact HR" - HR contact information

**Need more help?**
• Email: support@company.com
• Phone: (555) 123-4567
• Slack: #internal-docs-help

*This is InfoLens v1.0 - Your AI assistant for internal documentation*
      `;
      console.log("Sending help response");
      return res.json({ answer: helpResponse.trim() });
    }

    if (query.includes("contact") && query.includes("hr")) {
      const hrResponse = `
👥 **HR Contact Information**

**HR Department:**
• Email: hr@company.com
• Phone: (555) 123-4500
• Office: Building A, Floor 3

**HR Team:**
• Sarah Johnson - HR Director (ext. 4501)
• Mike Chen - Benefits Specialist (ext. 4502)
• Lisa Rodriguez - Recruiter (ext. 4503)

**Office Hours:**
• Monday-Friday: 9:00 AM - 5:00 PM
• Emergency: (555) 123-4599

**Common Requests:**
• Benefits questions → benefits@company.com
• Payroll issues → payroll@company.com  
• Policy questions → Use this InfoLens tool!

*For urgent matters, call the main HR line at (555) 123-4500*
      `;
      console.log("Sending HR contact response");
      return res.json({ answer: hrResponse.trim() });
    }

    // Handle special commands
    if (query.includes("show") && query.includes("hr")) {
      const hrDocs = docs.filter(d => d.category === "HR");
      let response = "👥 **HR Policies:**\n\n";
      hrDocs.forEach((doc, i) => {
        response += `${i + 1}. **${doc.title}** — ${doc.snippet}\n`;
      });
      return res.json({ answer: response });
    }

    if (query.includes("show") && query.includes("it")) {
      const itDocs = docs.filter(d => d.category === "IT");
      let response = "💻 **IT & Security Policies:**\n\n";
      itDocs.forEach((doc, i) => {
        response += `${i + 1}. **${doc.title}** — ${doc.snippet}\n`;
      });
      return res.json({ answer: response });
    }

    if (query.includes("show") && (query.includes("finance") || query.includes("financial"))) {
      const financeDocs = docs.filter(d => d.category === "Finance");
      let response = "💰 **Finance Policies:**\n\n";
      financeDocs.forEach((doc, i) => {
        response += `${i + 1}. **${doc.title}** — ${doc.snippet}\n`;
      });
      return res.json({ answer: response });
    }

    if (query.includes("show") && (query.includes("customer") || query.includes("support"))) {
      const customerDocs = docs.filter(d => d.category === "Customer Service");
      let response = "🛠️ **Customer Service Policies:**\n\n";
      customerDocs.forEach((doc, i) => {
        response += `${i + 1}. **${doc.title}** — ${doc.snippet}\n`;
      });
      return res.json({ answer: response });
    }

    if (query.includes("show") && (query.includes("general") || query.includes("company"))) {
      const generalDocs = docs.filter(d => d.category === "General");
      let response = "🏢 **General Company Policies:**\n\n";
      generalDocs.forEach((doc, i) => {
        response += `${i + 1}. **${doc.title}** — ${doc.snippet}\n`;
      });
      return res.json({ answer: response });
    }

    if (query.includes("show") && (query.includes("all") || query.includes("docs") || query.includes("documents"))) {
      let response = "📚 **All Available Documents:**\n\n";
      
      const categories = [...new Set(docs.map(d => d.category))];
      categories.forEach(category => {
        const categoryDocs = docs.filter(d => d.category === category);
        response += `**${category}:**\n`;
        categoryDocs.forEach((doc, i) => {
          response += `  ${i + 1}. ${doc.title} — ${doc.snippet}\n`;
        });
        response += "\n";
      });
      return res.json({ answer: response });
    }

    if (query.includes("popular") || query.includes("most searched")) {
      const popularDocs = [...docs].sort((a, b) => b.popularity - a.popularity).slice(0, 5);
      let response = "⭐ **Most Popular Documents:**\n\n";
      popularDocs.forEach((doc, i) => {
        response += `${i + 1}. **${doc.title}** (${doc.popularity}% popularity) — ${doc.snippet}\n`;
      });
      return res.json({ answer: response });
    }

    if (query.includes("recent") || query.includes("updated")) {
      const recentDocs = [...docs].sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)).slice(0, 5);
      let response = "📋 **Recently Updated Documents:**\n\n";
      recentDocs.forEach((doc, i) => {
        const updateDate = new Date(doc.lastUpdated).toLocaleDateString();
        response += `${i + 1}. **${doc.title}** (Updated: ${updateDate}) — ${doc.snippet}\n`;
      });
      return res.json({ answer: response });
    }

    if (query.includes("analytics") || query.includes("stats")) {
      const topTerms = Object.entries(searchAnalytics.popularTerms)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      
      let response = "📊 **Search Analytics:**\n\n";
      response += `Total searches: ${searchAnalytics.totalSearches}\n\n`;
      response += "**Top search terms:**\n";
      topTerms.forEach(([term, count], i) => {
        response += `${i + 1}. "${term}" (${count} searches)\n`;
      });
      return res.json({ answer: response });
    }

    // Regular document search
    const results = searchDocs(query);

    if (results.length > 0) {
      let response = "📂 **Search Results:**\n\n";
      
      // Show top 3 results with enhanced formatting
      results.slice(0, 3).forEach((doc, i) => {
        const relevanceScore = Math.max(60, doc.popularity);
        response += `${i + 1}. **${doc.title}** (${doc.category})\n`;
        response += `   ${doc.snippet}\n`;
        response += `   📊 Relevance: ${relevanceScore}% | 📅 Updated: ${new Date(doc.lastUpdated).toLocaleDateString()}\n\n`;
      });
      
      if (results.length > 3) {
        response += `💡 Found ${results.length - 3} more results. Try being more specific for better matches.\n\n`;
      }

      // Add helpful suggestions
      const relatedTags = results.slice(0, 3)
        .flatMap(doc => doc.tags || [])
        .filter((tag, index, array) => array.indexOf(tag) === index)
        .slice(0, 4);
      
      if (relatedTags.length > 0) {
        response += `**Related topics:** ${relatedTags.join(', ')}`;
      }
      
      return res.json({ answer: response });
    }

    // AI fallback with enhanced context
    if (process.env.OPENAI_API_KEY) {
      try {
        // Create context from available documents
        const contextDocs = docs.slice(0, 5).map(d => `${d.title}: ${d.snippet}`).join('\n');
        
        const OpenAI = require("openai");
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { 
              role: "system", 
              content: `You are InfoLens, a helpful AI assistant for company documentation. Here are some key documents available:

${contextDocs}

Help employees find information about HR policies, IT procedures, finance processes, and general company information. Be professional, helpful, and concise. If you don't know something specific, suggest they contact the relevant department.`
            },
            { role: "user", content: query }
          ],
          max_tokens: 300,
          temperature: 0.7
        });
        
        const aiAnswer = completion.choices[0].message.content;
        return res.json({ 
          answer: `💡 **AI Assistant Response:**\n\n${aiAnswer}\n\n*💭 This response is AI-generated. For official policies, please refer to the actual documents or contact the relevant department.*`
        });
      } catch (aiError) {
        console.error("OpenAI API Error:", aiError);
        // If AI fails, show suggestions as fallback
        const suggestions = [
          "Try searching for: 'leave policy', 'wfh policy', 'expenses', 'refund'",
          "Browse by category: HR, IT, Finance, Customer Service",
          "Use keywords like: policy, procedure, benefits, security"
        ];
        
        return res.json({ 
          answer: `🔍 **No exact matches found for "${query}"**\n\n**Suggestions:**\n• ${suggestions.join('\n• ')}\n\n**Quick links:**\n• Type "popular docs" for most viewed\n• Type "recent updates" for latest changes\n• Type "HR policies" for all HR documents`
        });
      }
    } else {
      // No AI configured, show suggestions
      const suggestions = [
        "Try searching for: 'leave policy', 'wfh policy', 'expenses', 'refund'",
        "Browse by category: HR, IT, Finance, Customer Service",
        "Use keywords like: policy, procedure, benefits, security"
      ];
      
      return res.json({ 
        answer: `🔍 **No exact matches found for "${query}"**\n\n**Suggestions:**\n• ${suggestions.join('\n• ')}\n\n**Quick links:**\n• Type "popular docs" for most viewed\n• Type "recent updates" for latest changes\n• Type "HR policies" for all HR documents\n\n*💡 Tip: Configure OpenAI API key to enable AI-powered responses for unmatched queries.*`
      });
    }

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ 
      answer: "⚠️ **System Error**\n\nSomething went wrong. Please try again or contact IT support if the issue persists."
    });
  }
});

// Analytics endpoint
app.get("/analytics", (req, res) => {
  const topTerms = Object.entries(searchAnalytics.popularTerms)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  res.json({
    totalSearches: searchAnalytics.totalSearches,
    topSearchTerms: topTerms,
    recentSearches: searchAnalytics.recentSearches,
    totalDocuments: docs.length,
    categoryCounts: {
      HR: docs.filter(d => d.category === 'HR').length,
      IT: docs.filter(d => d.category === 'IT').length,
      Finance: docs.filter(d => d.category === 'Finance').length,
      'Customer Service': docs.filter(d => d.category === 'Customer Service').length,
      General: docs.filter(d => d.category === 'General').length
    }
  });
});

// Documents endpoint (for admin features)
app.get("/documents", (req, res) => {
  const { category, limit } = req.query;
  let filteredDocs = docs;

  if (category) {
    filteredDocs = docs.filter(d => 
      d.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (limit) {
    filteredDocs = filteredDocs.slice(0, parseInt(limit));
  }

  res.json({
    documents: filteredDocs,
    total: filteredDocs.length,
    categories: [...new Set(docs.map(d => d.category))]
  });
});

// Health check with system info
app.get("/health", (req, res) => {
  res.json({ 
    status: "✅ InfoLens is running",
    timestamp: new Date().toISOString(),
    version: "2.0.0",
    features: {
      documents: docs.length,
      categories: [...new Set(docs.map(d => d.category))].length,
      aiEnabled: !!process.env.OPENAI_API_KEY,
      searchAnalytics: true
    },
    uptime: process.uptime()
  });
});

// Auto-suggestions endpoint
app.post("/suggest", (req, res) => {
  const { query } = req.body;
  if (!query || query.length < 2) {
    return res.json({ suggestions: [] });
  }

  const searchTerm = query.toLowerCase();
  const suggestions = [];

  // Title suggestions
  docs.forEach(doc => {
    if (doc.title.toLowerCase().includes(searchTerm)) {
      suggestions.push({
        text: doc.title,
        type: "document",
        category: doc.category
      });
    }
  });

  // Tag suggestions
  const allTags = [...new Set(docs.flatMap(d => d.tags || []))];
  allTags.forEach(tag => {
    if (tag.toLowerCase().includes(searchTerm) && 
        !suggestions.some(s => s.text === tag)) {
      suggestions.push({
        text: tag,
        type: "tag",
        category: "keyword"
      });
    }
  });

  // Category suggestions
  const categories = [...new Set(docs.map(d => d.category))];
  categories.forEach(category => {
    if (category.toLowerCase().includes(searchTerm) && 
        !suggestions.some(s => s.text === category)) {
      suggestions.push({
        text: `${category} policies`,
        type: "category",
        category: category
      });
    }
  });

  res.json({ 
    suggestions: suggestions.slice(0, 8).sort((a, b) => a.text.length - b.text.length)
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 InfoLens 2.0 running at http://localhost:${PORT}`);
  console.log(`📊 Analytics available at http://localhost:${PORT}/analytics`);
  console.log(`📋 Documents API at http://localhost:${PORT}/documents`);
  console.log(`🏥 Health check at http://localhost:${PORT}/health`);
  console.log(`💡 AI enabled: ${!!process.env.OPENAI_API_KEY}`);
  console.log(`📚 Total documents: ${docs.length}`);
  console.log("=== InfoLens ready for queries! ===");
});

module.exports = app;