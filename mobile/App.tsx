import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Role = "brand" | "influencer";
type Tab = "home" | "market" | "creators" | "messages" | "profile";
type ApplicationStatus = "pending" | "accepted" | "rejected";

type User = {
  id: string;
  role: Role;
  name: string;
  company: string;
  niche: string;
  location: string;
  bio: string;
  followers?: number;
  engagement?: number;
  rate?: number;
  tier: "free" | "basic" | "pro";
};

type Campaign = {
  id: string;
  brandId: string;
  title: string;
  description: string;
  category: string;
  budgetMin: number;
  budgetMax: number;
  timeline: string;
  deliverables: string;
  audience: string;
  featured?: boolean;
};

type Application = {
  id: string;
  campaignId: string;
  brandId: string;
  influencerId: string;
  pitch: string;
  fee: number;
  status: ApplicationStatus;
};

type Conversation = {
  id: string;
  participants: [string, string];
  campaignId?: string;
};

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: number;
};

const users: User[] = [
  {
    id: "brand-glowhaus",
    role: "brand",
    name: "Maya Chen",
    company: "GlowHaus Labs",
    niche: "Beauty",
    location: "New York",
    bio: "Clean skincare brand building creator-led launch campaigns.",
    tier: "basic",
  },
  {
    id: "brand-nourish",
    role: "brand",
    name: "Leo Grant",
    company: "Nourish Daily",
    niche: "Food",
    location: "Austin",
    bio: "Protein snack startup looking for warm, useful UGC.",
    tier: "pro",
  },
  {
    id: "creator-ava",
    role: "influencer",
    name: "Ava Kim",
    company: "Ava Creates",
    niche: "Beauty",
    location: "Los Angeles",
    bio: "Beauty creator focused on skincare routines and honest product education.",
    followers: 84200,
    engagement: 4.8,
    rate: 1500,
    tier: "pro",
  },
  {
    id: "creator-sam",
    role: "influencer",
    name: "Sam Rivera",
    company: "Everyday Sam",
    niche: "Lifestyle",
    location: "Miami",
    bio: "Lifestyle creator making polished routines, travel edits, and family-friendly reels.",
    followers: 126000,
    engagement: 3.9,
    rate: 2200,
    tier: "basic",
  },
  {
    id: "creator-jules",
    role: "influencer",
    name: "Jules Park",
    company: "Jules Eats",
    niche: "Food",
    location: "Seattle",
    bio: "Recipe developer with snack, meal prep, and taste-test videos.",
    followers: 57300,
    engagement: 6.2,
    rate: 950,
    tier: "free",
  },
];

const campaigns: Campaign[] = [
  {
    id: "campaign-serum",
    brandId: "brand-glowhaus",
    title: "Vitamin C serum UGC launch",
    description: "Create a premium content package for a new vitamin C serum launch.",
    category: "Beauty",
    budgetMin: 900,
    budgetMax: 2400,
    timeline: "14 days",
    deliverables: "1 reel, 3 stories, 5 raw clips",
    audience: "Skincare shoppers 18-34",
    featured: true,
  },
  {
    id: "campaign-sunscreen",
    brandId: "brand-glowhaus",
    title: "Mineral sunscreen summer push",
    description: "Show daily sunscreen use with texture shots and honest narration.",
    category: "Lifestyle",
    budgetMin: 700,
    budgetMax: 1800,
    timeline: "10 days",
    deliverables: "2 TikToks, 3 stills",
    audience: "Outdoor and beauty shoppers",
  },
  {
    id: "campaign-protein",
    brandId: "brand-nourish",
    title: "Protein snack recipe series",
    description: "Turn protein bites into recipe and taste-test content.",
    category: "Food",
    budgetMin: 500,
    budgetMax: 1400,
    timeline: "7 days",
    deliverables: "3 short videos, raw rights",
    audience: "Fitness and busy-parent audiences",
    featured: true,
  },
];

const startingApplications: Application[] = [
  {
    id: "application-serum-ava",
    campaignId: "campaign-serum",
    brandId: "brand-glowhaus",
    influencerId: "creator-ava",
    pitch: "GRWM reel with product education, texture closeups, and usage-rights raw clips.",
    fee: 1500,
    status: "accepted",
  },
  {
    id: "application-protein-jules",
    campaignId: "campaign-protein",
    brandId: "brand-nourish",
    influencerId: "creator-jules",
    pitch: "Three snack recipe videos with taste-test hooks and meal-prep positioning.",
    fee: 900,
    status: "pending",
  },
];

const startingConversations: Conversation[] = [
  {
    id: "conversation-glowhaus-ava",
    participants: ["brand-glowhaus", "creator-ava"],
    campaignId: "campaign-serum",
  },
  {
    id: "conversation-nourish-jules",
    participants: ["brand-nourish", "creator-jules"],
    campaignId: "campaign-protein",
  },
];

const startingMessages: Message[] = [
  {
    id: "message-1",
    conversationId: "conversation-glowhaus-ava",
    senderId: "brand-glowhaus",
    body: "Your pitch fits the launch perfectly. Can you send a shot list today?",
    createdAt: Date.now() - 1000 * 60 * 43,
  },
  {
    id: "message-2",
    conversationId: "conversation-glowhaus-ava",
    senderId: "creator-ava",
    body: "Yes. I will include a hook, texture closeup, GRWM sequence, and CTA variations.",
    createdAt: Date.now() - 1000 * 60 * 38,
  },
];

function money(value: number) {
  return `$${value.toLocaleString()}`;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}`;
}

function timeAgo(value: number) {
  const mins = Math.max(1, Math.round((Date.now() - value) / 60000));
  return mins < 60 ? `${mins}m` : `${Math.round(mins / 60)}h`;
}

export default function App() {
  const [currentUserId, setCurrentUserId] = useState("brand-glowhaus");
  const [tab, setTab] = useState<Tab>("home");
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [applications, setApplications] = useState(startingApplications);
  const [conversations, setConversations] = useState(startingConversations);
  const [messages, setMessages] = useState(startingMessages);
  const [selectedConversationId, setSelectedConversationId] = useState("conversation-glowhaus-ava");
  const [notice, setNotice] = useState("Mobile demo ready. Switch roles to test both sides.");

  const currentUser = users.find((user) => user.id === currentUserId) ?? users[0];
  const creators = users.filter((user) => user.role === "influencer");
  const brands = users.filter((user) => user.role === "brand");
  const myApplications = applications.filter((application) =>
    currentUser.role === "brand"
      ? application.brandId === currentUser.id
      : application.influencerId === currentUser.id
  );
  const myConversations = conversations.filter((conversation) =>
    conversation.participants.includes(currentUser.id)
  );
  const selectedConversation =
    myConversations.find((conversation) => conversation.id === selectedConversationId) ??
    myConversations[0];
  const selectedMessages = messages.filter(
    (message) => message.conversationId === selectedConversation?.id
  );

  const filteredCampaigns = useMemo(() => {
    const q = query.trim().toLowerCase();
    return campaigns
      .filter((campaign) => selectedCategory === "All" || campaign.category === selectedCategory)
      .filter((campaign) =>
        [campaign.title, campaign.description, campaign.category, campaign.audience]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
      .sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [query, selectedCategory]);

  const stats =
    currentUser.role === "brand"
      ? [
          { label: "Campaigns", value: "3" },
          { label: "Applications", value: String(myApplications.length) },
          { label: "Creators", value: String(creators.length) },
        ]
      : [
          { label: "Applications", value: String(myApplications.length) },
          { label: "Open briefs", value: String(campaigns.length) },
          { label: "Rate", value: money(currentUser.rate ?? 0) },
        ];

  function findConversation(a: string, b: string) {
    return conversations.find(
      (conversation) => conversation.participants.includes(a) && conversation.participants.includes(b)
    );
  }

  function openConversation(otherUserId: string, campaignId?: string) {
    const existing = findConversation(currentUser.id, otherUserId);
    if (existing) {
      setSelectedConversationId(existing.id);
      setTab("messages");
      return;
    }
    const next: Conversation = {
      id: makeId("conversation"),
      participants: [currentUser.id, otherUserId],
      campaignId,
    };
    setConversations((items) => [next, ...items]);
    setSelectedConversationId(next.id);
    setTab("messages");
  }

  function applyToCampaign(campaign: Campaign) {
    if (currentUser.role !== "influencer") return;
    const existing = applications.some(
      (application) => application.campaignId === campaign.id && application.influencerId === currentUser.id
    );
    if (existing) {
      setNotice("Already applied to this campaign.");
      return;
    }
    const conversation = findConversation(campaign.brandId, currentUser.id) ?? {
      id: makeId("conversation"),
      participants: [campaign.brandId, currentUser.id] as [string, string],
      campaignId: campaign.id,
    };
    if (!conversations.some((item) => item.id === conversation.id)) {
      setConversations((items) => [conversation, ...items]);
    }
    setApplications((items) => [
      {
        id: makeId("application"),
        campaignId: campaign.id,
        brandId: campaign.brandId,
        influencerId: currentUser.id,
        pitch: `I can deliver ${campaign.deliverables} with a strong ${campaign.category} audience fit.`,
        fee: Math.round((campaign.budgetMin + campaign.budgetMax) / 2),
        status: "pending",
      },
      ...items,
    ]);
    setMessages((items) => [
      ...items,
      {
        id: makeId("message"),
        conversationId: conversation.id,
        senderId: currentUser.id,
        body: `I just applied to ${campaign.title}. Happy to tailor the concept.`,
        createdAt: Date.now(),
      },
    ]);
    setSelectedConversationId(conversation.id);
    setTab("messages");
    setNotice("Application sent and conversation opened.");
  }

  function reviewApplication(applicationId: string, status: ApplicationStatus) {
    setApplications((items) =>
      items.map((application) =>
        application.id === applicationId ? { ...application, status } : application
      )
    );
    setNotice(`Application marked ${status}.`);
  }

  function sendMessage() {
    if (!selectedConversation) return;
    setMessages((items) => [
      ...items,
      {
        id: makeId("message"),
        conversationId: selectedConversation.id,
        senderId: currentUser.id,
        body:
          currentUser.role === "brand"
            ? "Looks good. Can you send final deliverables by Friday?"
            : "Absolutely. I will send the shot list and timeline today.",
        createdAt: Date.now(),
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.appShell}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoMark}>C</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.kicker}>CollabHub Mobile</Text>
            <Text style={styles.title}>Creator deals, anywhere.</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roleSwitcher}>
          {[...brands, ...creators].map((user) => (
            <Pill
              key={user.id}
              active={user.id === currentUser.id}
              label={`${user.role}: ${user.name}`}
              onPress={() => {
                setCurrentUserId(user.id);
                setNotice(`Switched to ${user.name}.`);
              }}
            />
          ))}
        </ScrollView>

        <View style={styles.notice}>
          <Text style={styles.noticeText}>{notice}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {tab === "home" && (
            <HomeScreen
              applications={myApplications}
              creators={creators}
              currentUser={currentUser}
              onOpenConversation={openConversation}
              onReview={reviewApplication}
              onTab={setTab}
              stats={stats}
            />
          )}
          {tab === "market" && (
            <MarketScreen
              applications={applications}
              campaigns={filteredCampaigns}
              currentUser={currentUser}
              onApply={applyToCampaign}
              onCategory={setSelectedCategory}
              onOpenConversation={openConversation}
              onQuery={setQuery}
              query={query}
              selectedCategory={selectedCategory}
            />
          )}
          {tab === "creators" && (
            <CreatorsScreen creators={creators} currentUser={currentUser} onOpenConversation={openConversation} />
          )}
          {tab === "messages" && (
            <MessagesScreen
              campaigns={campaigns}
              conversations={myConversations}
              currentUser={currentUser}
              messages={selectedMessages}
              onSelect={setSelectedConversationId}
              onSend={sendMessage}
              selectedConversation={selectedConversation}
            />
          )}
          {tab === "profile" && <ProfileScreen currentUser={currentUser} />}
        </ScrollView>

        <View style={styles.tabBar}>
          <TabButton active={tab === "home"} label="Home" onPress={() => setTab("home")} />
          <TabButton active={tab === "market"} label="Market" onPress={() => setTab("market")} />
          <TabButton active={tab === "creators"} label="Creators" onPress={() => setTab("creators")} />
          <TabButton active={tab === "messages"} label="Chat" onPress={() => setTab("messages")} />
          <TabButton active={tab === "profile"} label="Profile" onPress={() => setTab("profile")} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function HomeScreen({
  applications,
  creators,
  currentUser,
  onOpenConversation,
  onReview,
  onTab,
  stats,
}: {
  applications: Application[];
  creators: User[];
  currentUser: User;
  onOpenConversation: (id: string, campaignId?: string) => void;
  onReview: (id: string, status: ApplicationStatus) => void;
  onTab: (tab: Tab) => void;
  stats: { label: string; value: string }[];
}) {
  return (
    <View style={styles.screen}>
      <View style={styles.heroCard}>
        <Text style={styles.heroKicker}>Instant demo</Text>
        <Text style={styles.heroTitle}>
          {currentUser.role === "brand" ? "Manage creator partnerships." : "Find paid campaigns faster."}
        </Text>
        <Text style={styles.heroBody}>
          Switch between brand and influencer profiles to test campaign discovery, applications, and messaging.
        </Text>
      </View>

      <View style={styles.statGrid}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <SectionHeader title="Profile checklist" action="Edit" onPress={() => onTab("profile")} />
      <View style={styles.card}>
        {["Bio complete", "Niche selected", "Plan selected", "First conversation"].map((item, index) => (
          <View key={item} style={styles.checkRow}>
            <Text style={styles.checkDot}>{index < 3 ? "OK" : "-"}</Text>
            <Text style={styles.bodyText}>{item}</Text>
            <Text style={index < 3 ? styles.readyText : styles.mutedText}>{index < 3 ? "Done" : "Next"}</Text>
          </View>
        ))}
      </View>

      <SectionHeader title={currentUser.role === "brand" ? "Applications to review" : "Your pipeline"} />
      {applications.length === 0 ? (
        <EmptyState title="No applications yet" body="Marketplace activity will show here." />
      ) : (
        applications.slice(0, 3).map((application) => (
          <ApplicationCard
            key={application.id}
            application={application}
            currentUser={currentUser}
            onOpenConversation={onOpenConversation}
            onReview={onReview}
          />
        ))
      )}

      {currentUser.role === "brand" && (
        <>
          <SectionHeader title="Featured creators" action="See all" onPress={() => onTab("creators")} />
          {creators.slice(0, 2).map((creator) => (
            <CreatorCard key={creator.id} creator={creator} currentUser={currentUser} onOpenConversation={onOpenConversation} />
          ))}
        </>
      )}
    </View>
  );
}

function MarketScreen({
  applications,
  campaigns: visibleCampaigns,
  currentUser,
  onApply,
  onCategory,
  onOpenConversation,
  onQuery,
  query,
  selectedCategory,
}: {
  applications: Application[];
  campaigns: Campaign[];
  currentUser: User;
  onApply: (campaign: Campaign) => void;
  onCategory: (category: string) => void;
  onOpenConversation: (id: string, campaignId?: string) => void;
  onQuery: (query: string) => void;
  query: string;
  selectedCategory: string;
}) {
  return (
    <View style={styles.screen}>
      <TextInput
        value={query}
        onChangeText={onQuery}
        placeholder="Search campaigns..."
        placeholderTextColor="#7E7A72"
        style={styles.search}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
        {["All", "Beauty", "Lifestyle", "Food", "Fitness", "Fashion"].map((category) => (
          <Pill
            key={category}
            active={selectedCategory === category}
            label={category}
            onPress={() => onCategory(category)}
          />
        ))}
      </ScrollView>
      {visibleCampaigns.map((campaign) => (
        <CampaignCard
          key={campaign.id}
          applications={applications}
          campaign={campaign}
          currentUser={currentUser}
          onApply={onApply}
          onOpenConversation={onOpenConversation}
        />
      ))}
      {visibleCampaigns.length === 0 && <EmptyState title="No campaigns found" body="Try a different search or category." />}
    </View>
  );
}

function CreatorsScreen({
  creators,
  currentUser,
  onOpenConversation,
}: {
  creators: User[];
  currentUser: User;
  onOpenConversation: (id: string) => void;
}) {
  return (
    <View style={styles.screen}>
      {creators.map((creator) => (
        <CreatorCard key={creator.id} creator={creator} currentUser={currentUser} onOpenConversation={onOpenConversation} />
      ))}
    </View>
  );
}

function MessagesScreen({
  campaigns: campaignList,
  conversations: activeConversations,
  currentUser,
  messages: activeMessages,
  onSelect,
  onSend,
  selectedConversation,
}: {
  campaigns: Campaign[];
  conversations: Conversation[];
  currentUser: User;
  messages: Message[];
  onSelect: (id: string) => void;
  onSend: () => void;
  selectedConversation?: Conversation;
}) {
  const otherId = selectedConversation?.participants.find((id) => id !== currentUser.id);
  const other = users.find((user) => user.id === otherId);
  const campaign = campaignList.find((item) => item.id === selectedConversation?.campaignId);

  return (
    <View style={styles.screen}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.conversationRow}>
        {activeConversations.map((conversation) => {
          const partner = users.find((user) => user.id === conversation.participants.find((id) => id !== currentUser.id));
          return (
            <Pressable key={conversation.id} style={styles.conversationChip} onPress={() => onSelect(conversation.id)}>
              <Text style={styles.conversationName}>{partner?.name}</Text>
              <Text style={styles.mutedText}>Open deal</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.card}>
        <Text style={styles.kicker}>{campaign?.title ?? "General partnership"}</Text>
        <Text style={styles.cardTitle}>{other?.name ?? "No conversation selected"}</Text>
        <Text style={styles.readyText}>Typing indicators and file attachments can plug in next.</Text>
      </View>

      {activeMessages.map((message) => (
        <View
          key={message.id}
          style={[
            styles.messageBubble,
            message.senderId === currentUser.id ? styles.myMessage : styles.theirMessage,
          ]}
        >
          <Text style={message.senderId === currentUser.id ? styles.myMessageText : styles.messageText}>{message.body}</Text>
          <Text style={message.senderId === currentUser.id ? styles.myMessageTime : styles.messageTime}>
            {timeAgo(message.createdAt)} ago
          </Text>
        </View>
      ))}

      <Pressable style={styles.primaryButton} onPress={onSend}>
        <Text style={styles.primaryButtonText}>Send sample reply</Text>
      </Pressable>
    </View>
  );
}

function ProfileScreen({ currentUser }: { currentUser: User }) {
  return (
    <View style={styles.screen}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(currentUser.name)}</Text>
        </View>
        <Text style={styles.heroTitle}>{currentUser.name}</Text>
        <Text style={styles.heroBody}>{currentUser.company}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.kicker}>Bio</Text>
        <Text style={styles.bodyText}>{currentUser.bio}</Text>
      </View>
      <View style={styles.statGrid}>
        <Metric label="Niche" value={currentUser.niche} />
        <Metric label="Plan" value={currentUser.tier} />
        <Metric label="Location" value={currentUser.location} />
      </View>
      {currentUser.role === "influencer" && (
        <View style={styles.statGrid}>
          <Metric label="Followers" value={(currentUser.followers ?? 0).toLocaleString()} />
          <Metric label="Engagement" value={`${currentUser.engagement ?? 0}%`} />
          <Metric label="Rate" value={money(currentUser.rate ?? 0)} />
        </View>
      )}
    </View>
  );
}

function CampaignCard({
  applications: allApplications,
  campaign,
  currentUser,
  onApply,
  onOpenConversation,
}: {
  applications: Application[];
  campaign: Campaign;
  currentUser: User;
  onApply: (campaign: Campaign) => void;
  onOpenConversation: (id: string, campaignId?: string) => void;
}) {
  const brand = users.find((user) => user.id === campaign.brandId);
  const applied = allApplications.some(
    (application) => application.campaignId === campaign.id && application.influencerId === currentUser.id
  );

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View>
          <View style={styles.badgeRow}>
            {campaign.featured && <Badge label="Featured" tone="green" />}
            <Badge label={campaign.category} />
          </View>
          <Text style={styles.cardTitle}>{campaign.title}</Text>
          <Text style={styles.mutedText}>{brand?.company} / {brand?.location}</Text>
        </View>
        <View style={styles.budgetPill}>
          <Text style={styles.budgetLabel}>Budget</Text>
          <Text style={styles.budgetValue}>{money(campaign.budgetMin)}+</Text>
        </View>
      </View>
      <Text style={styles.bodyText}>{campaign.description}</Text>
      <View style={styles.infoGrid}>
        <Info label="Timeline" value={campaign.timeline} />
        <Info label="Deliverables" value={campaign.deliverables} />
      </View>
      <Text style={styles.mutedText}>Audience: {campaign.audience}</Text>
      <View style={styles.buttonRow}>
        {currentUser.role === "influencer" && (
          <Pressable
            disabled={applied}
            style={[styles.primaryButton, applied && styles.disabledButton]}
            onPress={() => onApply(campaign)}
          >
            <Text style={styles.primaryButtonText}>{applied ? "Applied" : "Apply"}</Text>
          </Pressable>
        )}
        {brand && brand.id !== currentUser.id && (
          <Pressable style={styles.secondaryButton} onPress={() => onOpenConversation(brand.id, campaign.id)}>
            <Text style={styles.secondaryButtonText}>Message</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function CreatorCard({
  creator,
  currentUser,
  onOpenConversation,
}: {
  creator: User;
  currentUser: User;
  onOpenConversation: (id: string) => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.creatorHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(creator.name)}</Text>
        </View>
        <View style={styles.creatorInfo}>
          <Text style={styles.cardTitle}>{creator.name}</Text>
          <Text style={styles.mutedText}>{creator.niche} / {creator.location}</Text>
        </View>
        <Badge label="Verified" tone="green" />
      </View>
      <Text style={styles.bodyText}>{creator.bio}</Text>
      <View style={styles.statGrid}>
        <Metric label="Followers" value={(creator.followers ?? 0).toLocaleString()} />
        <Metric label="Engage" value={`${creator.engagement ?? 0}%`} />
        <Metric label="Rate" value={money(creator.rate ?? 0)} />
      </View>
      {currentUser.role === "brand" && (
        <Pressable style={styles.primaryButton} onPress={() => onOpenConversation(creator.id)}>
          <Text style={styles.primaryButtonText}>Invite creator</Text>
        </Pressable>
      )}
    </View>
  );
}

function ApplicationCard({
  application,
  currentUser,
  onOpenConversation,
  onReview,
}: {
  application: Application;
  currentUser: User;
  onOpenConversation: (id: string, campaignId?: string) => void;
  onReview: (id: string, status: ApplicationStatus) => void;
}) {
  const campaign = campaigns.find((item) => item.id === application.campaignId);
  const creator = users.find((user) => user.id === application.influencerId);
  const brand = users.find((user) => user.id === application.brandId);

  return (
    <View style={styles.card}>
      <View style={styles.badgeRow}>
        <Badge label={application.status} tone={application.status === "accepted" ? "green" : "gold"} />
        <Badge label={campaign?.category ?? "Campaign"} />
      </View>
      <Text style={styles.cardTitle}>{campaign?.title}</Text>
      <Text style={styles.mutedText}>{currentUser.role === "brand" ? creator?.name : brand?.company}</Text>
      <Text style={styles.bodyText}>{application.pitch}</Text>
      <Text style={styles.readyText}>{money(application.fee)} proposed fee</Text>
      <View style={styles.buttonRow}>
        {currentUser.role === "brand" && application.status === "pending" && (
          <>
            <Pressable style={styles.primaryButton} onPress={() => onReview(application.id, "accepted")}>
              <Text style={styles.primaryButtonText}>Accept</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => onReview(application.id, "rejected")}>
              <Text style={styles.secondaryButtonText}>Reject</Text>
            </Pressable>
          </>
        )}
        <Pressable
          style={styles.secondaryButton}
          onPress={() =>
            onOpenConversation(
              currentUser.role === "brand" ? application.influencerId : application.brandId,
              application.campaignId
            )
          }
        >
          <Text style={styles.secondaryButtonText}>Chat</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SectionHeader({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && onPress && (
        <Pressable onPress={onPress}>
          <Text style={styles.actionText}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoBox}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function Badge({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "green" | "gold" }) {
  return (
    <View style={[styles.badge, tone === "green" && styles.greenBadge, tone === "gold" && styles.goldBadge]}>
      <Text style={[styles.badgeText, tone === "green" && styles.greenBadgeText, tone === "gold" && styles.goldBadgeText]}>
        {label}
      </Text>
    </View>
  );
}

function Pill({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable style={[styles.pill, active && styles.activePill]} onPress={onPress}>
      <Text style={[styles.pillText, active && styles.activePillText]}>{label}</Text>
    </Pressable>
  );
}

function TabButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.tabButton} onPress={onPress}>
      <Text style={[styles.tabText, active && styles.activeTabText]}>{label}</Text>
      {active && <View style={styles.tabIndicator} />}
    </Pressable>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.mutedText}>{body}</Text>
    </View>
  );
}

const colors = {
  bg: "#08070A",
  card: "#15131A",
  cardSoft: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.10)",
  text: "#FFFFFF",
  muted: "#9D988F",
  accent: "#FFB088",
  green: "#80FFB0",
  ink: "#101014",
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  appShell: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: colors.text,
    alignItems: "center",
    justifyContent: "center",
  },
  logoMark: {
    color: colors.ink,
    fontWeight: "900",
    fontSize: 22,
  },
  headerText: {
    flex: 1,
  },
  kicker: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.8,
    marginTop: 2,
  },
  roleSwitcher: {
    paddingHorizontal: 20,
    maxHeight: 44,
  },
  pill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginRight: 8,
    backgroundColor: colors.cardSoft,
  },
  activePill: {
    backgroundColor: colors.text,
  },
  pillText: {
    color: colors.muted,
    fontWeight: "700",
    fontSize: 12,
    textTransform: "capitalize",
  },
  activePillText: {
    color: colors.ink,
  },
  notice: {
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(128,255,176,0.22)",
    backgroundColor: "rgba(128,255,176,0.10)",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  noticeText: {
    color: "#BFFFF0",
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    padding: 20,
    paddingBottom: 110,
  },
  screen: {
    gap: 16,
  },
  heroCard: {
    borderRadius: 30,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  heroKicker: {
    color: colors.green,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: colors.text,
    fontSize: 34,
    lineHeight: 36,
    fontWeight: "900",
    letterSpacing: -1.2,
    marginTop: 8,
  },
  heroBody: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  statGrid: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 22,
    padding: 14,
    backgroundColor: colors.cardSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  statLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  actionText: {
    color: colors.accent,
    fontWeight: "800",
  },
  card: {
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    gap: 12,
  },
  cardTop: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  cardTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  bodyText: {
    color: "#D8D4CB",
    fontSize: 14,
    lineHeight: 21,
  },
  mutedText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  readyText: {
    color: colors.green,
    fontSize: 12,
    fontWeight: "800",
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 5,
  },
  checkDot: {
    color: colors.green,
    fontWeight: "900",
    width: 18,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.cardSoft,
  },
  greenBadge: {
    backgroundColor: "rgba(128,255,176,0.12)",
  },
  goldBadge: {
    backgroundColor: "rgba(255,176,136,0.14)",
  },
  badgeText: {
    color: "#D6D1C7",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  greenBadgeText: {
    color: colors.green,
  },
  goldBadgeText: {
    color: colors.accent,
  },
  budgetPill: {
    borderRadius: 18,
    backgroundColor: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignSelf: "flex-start",
  },
  budgetLabel: {
    color: "rgba(0,0,0,0.45)",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  budgetValue: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  infoGrid: {
    flexDirection: "row",
    gap: 8,
  },
  infoBox: {
    flex: 1,
    borderRadius: 18,
    padding: 10,
    backgroundColor: colors.cardSoft,
  },
  infoLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  infoValue: {
    color: colors.text,
    fontSize: 12,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  primaryButton: {
    borderRadius: 999,
    backgroundColor: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 11,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.4,
  },
  primaryButtonText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900",
  },
  secondaryButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 11,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  search: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: colors.text,
    backgroundColor: colors.card,
    fontSize: 15,
  },
  categoryRow: {
    maxHeight: 42,
  },
  creatorHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  creatorInfo: {
    flex: 1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 20,
    backgroundColor: "#7B61FF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.text,
    fontWeight: "900",
  },
  conversationRow: {
    maxHeight: 70,
  },
  conversationChip: {
    width: 170,
    marginRight: 10,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  conversationName: {
    color: colors.text,
    fontWeight: "800",
  },
  messageBubble: {
    borderRadius: 22,
    padding: 13,
    maxWidth: "86%",
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: colors.text,
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    color: "#D8D4CB",
    lineHeight: 20,
  },
  myMessageText: {
    color: colors.ink,
    lineHeight: 20,
  },
  messageTime: {
    color: colors.muted,
    fontSize: 10,
    marginTop: 5,
  },
  myMessageTime: {
    color: "rgba(0,0,0,0.45)",
    fontSize: 10,
    marginTop: 5,
  },
  profileHeader: {
    alignItems: "center",
    borderRadius: 30,
    padding: 24,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metric: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: colors.cardSoft,
    padding: 10,
  },
  metricValue: {
    color: colors.text,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 4,
  },
  emptyState: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    gap: 6,
  },
  tabBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 14,
    flexDirection: "row",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(15,14,20,0.96)",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    gap: 5,
  },
  tabText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
  },
  activeTabText: {
    color: colors.text,
  },
  tabIndicator: {
    width: 20,
    height: 3,
    borderRadius: 99,
    backgroundColor: colors.green,
  },
});
