import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, X, Instagram, Linkedin, Mail, Github, Loader2, User as UserIcon, CheckCircle2, Circle, ZoomIn, ZoomOut } from "lucide-react";
import { toast, Toaster } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { memberService } from "../../../services/memberService";
import { supabase } from "../../../lib/supabase";

interface Member {
  member_id: string;
  member_name: string;
  member_postion: string;
  member_profile_picture_key: string;
  member_crn: number | null;
  member_urn: number;
  member_email: string;
  member_department: string;
  member_semester: number;
  member_club_department: string;
  socials: {
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
  created_at: string;
}

const parseCSV = (text: string) => {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').map(line => line.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const parseCSVLine = (line: string) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/[\s_]/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0 || (values.length === 1 && values[0] === '')) continue;
    
    const obj: any = {};
    headers.forEach((header, index) => {
      let val = values[index] || '';
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1).trim();
      }
      obj[header] = val;
    });
    rows.push(obj);
  }
  return rows;
};

const parseClassSection = (val: string) => {
  if (!val) return null;
  const cleanVal = val.trim();
  
  const matchD = cleanVal.match(/^[dD](\d)/);
  if (!matchD) return null;
  
  const year = parseInt(matchD[1], 10);
  let rest = cleanVal.slice(matchD[0].length).trim();
  
  const validStreams = ['CSE', 'ECE', 'RAI', 'BBA', 'BCA', 'ME', 'CE', 'EE', 'IT'];
  let foundStream: string | null = null;
  let section = '';
  
  for (const stream of validStreams) {
    const regex = new RegExp(`^${stream}\\b|^${stream}(?=[^a-zA-Z]|$)`, 'i');
    const streamMatch = rest.match(regex);
    if (streamMatch) {
      foundStream = stream;
      section = rest.slice(streamMatch[0].length).replace(/^[-_\s]+/, '').trim();
      break;
    }
  }
  
  if (!foundStream) {
    for (const stream of validStreams) {
      const idx = rest.toUpperCase().indexOf(stream);
      if (idx !== -1) {
        foundStream = stream;
        section = (rest.slice(0, idx) + rest.slice(idx + stream.length)).replace(/^[-_\s]+/, '').trim();
        break;
      }
    }
  }

  if (!foundStream) return null;
  if (!section) return null;
  
  return {
    year,
    semester: year * 2 - 1,
    department: foundStream.toUpperCase(),
    section
  };
};

const parseSocialLink = (val: any) => {
  if (!val) return undefined;
  const clean = String(val).trim();
  if (/^(nil|no|not any|none|\.|-)$/i.test(clean)) {
    return undefined;
  }
  if (/^(https?:\/\/|www\.)/i.test(clean)) {
    return clean.startsWith('www.') ? `https://${clean}` : clean;
  }
  return undefined;
};

const processCsvRows = (rows: any[], overridePos: string, userId: string) => {
  const valid: any[] = [];
  const unresolved: any[] = [];

  const validPositions = [
    'CONVENOR', 'CO-CONVENOR', 
    'TECHNICAL_HEAD', 'CO-TECHNICAL_HEAD',
    'FINANCE_&_AI_HEAD', 'CO-FINANCE_&_AI_HEAD',
    'DISCIPLINE_HEAD', 'CO-DISCIPLINE_HEAD',
    'DOCUMENTATION_HEAD', 'CO-DOCUMENTATION_HEAD',
    'EVENT_MANAGEMENT_HEAD', 'CO-EVENT_MANAGEMENT_HEAD',
    'CREATIVE_HEAD', 'CO-CREATIVE_HEAD',
    'PROMOTION_HEAD', 'CO-PROMOTION_HEAD',
    'SOCIAL_MEDIA_HEAD', 'CO-SOCIAL_MEDIA_HEAD',
    'ANCHORING_HEAD', 'CO-ANCHORING_HEAD',
    'PHOTOGRAPHY_&_VIDEOGRAPHY_HEAD', 'CO-PHOTOGRAPHY_&_VIDEOGRAPHY_HEAD',
    'EXECUTIVE_MEMBER', 'ACTIVE_MEMBER'
  ];

  rows.forEach((r, idx) => {
    if (!r) return;

    const name = (r.membername || r.name || r.fullname || r.memberName || '').trim();
    let position = overridePos || r.memberpostion || r.memberposition || r.position || r.role || r.memberPosition || '';
    if (position) {
      position = position.toUpperCase().trim().replace(/[-\s]+/g, '_');
    }
    const urn = r.memberurn || r.urn || r.memberUrn || '';
    const email = (r.memberemail || r.email || r.memberEmail || '').trim();
    const rawClassSection = r.classsection || r.classsectionlink || r.classsectionformat || r.classsectioninfo || r.class_section || r.classsectioninfo || r.class || '';

    const parsedClass = parseClassSection(rawClassSection);
    
    const socials: any = {};
    const linkedin = parseSocialLink(r.linkedinprofilelink || r.linkedin || r.linkedinlink);
    const github = parseSocialLink(r.githubprofilelink || r.github || r.githublink);
    const portfolio = parseSocialLink(r.portfoliolink || r.portfolio || r.portfoliolinkifany || r.portfoliolink_ifany);
    if (linkedin) socials.linkedin = linkedin;
    if (github) socials.github = github;
    if (portfolio) socials.portfolio = portfolio;

    const errors: string[] = [];
    if (!name) errors.push("Missing name");
    if (!email) errors.push("Missing email");
    
    let mappedPos = position;
    if (!mappedPos) {
      errors.push("Missing position");
    } else if (!validPositions.includes(mappedPos)) {
      errors.push(`Invalid position '${mappedPos}'`);
    }

    if (!urn || isNaN(Number(urn))) {
      errors.push("Missing or invalid URN");
    }

    let semester = undefined;
    let department = '';
    let section = '';

    if (!rawClassSection) {
      errors.push("Missing Class+Section");
    } else if (!parsedClass) {
      errors.push(`Invalid Class/Section: '${rawClassSection}'`);
    } else {
      semester = parsedClass.semester;
      department = parsedClass.department || '';
      section = parsedClass.section || '';
    }

    const record = {
      id: `row-${idx}-${Date.now()}`,
      member_name: name,
      member_postion: mappedPos,
      member_urn: urn ? Number(urn) : undefined,
      member_email: email,
      member_department: department,
      member_semester: semester,
      member_crn: r.membercrn || r.crn || r.memberCrn ? Number(r.membercrn || r.crn || r.memberCrn) : null,
      member_club_department: r.memberclubdepartment || r.clubdepartment || r.clubdept || r.memberClubDepartment || null,
      socials,
      created_by: userId,
      rawClassSection
    };

    if (errors.length > 0) {
      unresolved.push({
        ...record,
        reason: errors.join(', ')
      });
    } else {
      valid.push(record);
    }
  });

  return { valid, unresolved };
};

const POSITION_RANK: Record<string, number> = {
  'CONVENOR': 1,
  'CO-CONVENOR': 2,
  'TECHNICAL_HEAD': 3,
  'CO-TECHNICAL_HEAD': 4,
  'FINANCE_&_AI_HEAD': 5,
  'CO-FINANCE_&_AI_HEAD': 6,
  'DISCIPLINE_HEAD': 7,
  'CO-DISCIPLINE_HEAD': 8,
  'DOCUMENTATION_HEAD': 9,
  'CO-DOCUMENTATION_HEAD': 10,
  'EVENT_MANAGEMENT_HEAD': 11,
  'CO-EVENT_MANAGEMENT_HEAD': 12,
  'CREATIVE_HEAD': 13,
  'CO-CREATIVE_HEAD': 14,
  'PROMOTION_HEAD': 15,
  'CO-PROMOTION_HEAD': 16,
  'SOCIAL_MEDIA_HEAD': 17,
  'CO-SOCIAL_MEDIA_HEAD': 18,
  'ANCHORING_HEAD': 19,
  'CO-ANCHORING_HEAD': 20,
  'PHOTOGRAPHY_&_VIDEOGRAPHY_HEAD': 21,
  'CO-PHOTOGRAPHY_&_VIDEOGRAPHY_HEAD': 22,
  'EXECUTIVE_MEMBER': 23,
  'ACTIVE_MEMBER': 24,
};

const CLUB_DEPARTMENTS = [
  'CONVENOR',
  'CO-CONVENOR',
  'TECHNICAL',
  'FINANCE & AI',
  'DISCIPLINE',
  'DOCUMENTATION',
  'EVENT MANAGEMENT',
  'CREATIVE',
  'PROMOTION',
  'SOCIAL MEDIA',
  'ANCHORING',
  'PHOTOGRAPHY & VIDEOGRAPHY',
] as const;

const getPositionRank = (position: string): number => {
  if (!position) return 99;
  const upperPos = position.toUpperCase().trim();
  if (POSITION_RANK[upperPos]) return POSITION_RANK[upperPos];
  if (upperPos.includes('HEAD')) return 6.5;
  if (upperPos.includes('EXECUTIVE')) return 7;
  if (upperPos.includes('ACTIVE')) return 8;
  return 9;
};

const sortMembersByHierarchy = (memberList: Member[]): Member[] => {
  return [...memberList].sort((a, b) => {
    const rankA = getPositionRank(a.member_postion);
    const rankB = getPositionRank(b.member_postion);
    if (rankA !== rankB) {
      return rankA - rankB;
    }
    return a.member_name.localeCompare(b.member_name);
  });
};

import { useAdminSearch } from "../../context/AdminSearchContext";

export function AdminMembers() {
  const { userId, logout } = useAuth();
  const { searchQuery, setSearchPlaceholder } = useAdminSearch();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  useEffect(() => {
    setSearchPlaceholder("Search members by name, position, email, URN, CRN...");
  }, [setSearchPlaceholder]);

  const fetchMembers = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await memberService.getAdminMembers(userId);
      setMembers(sortMembersByHierarchy(data));
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch members");
      // If the admin's own ID is not found, force logout
      if (error.message && error.message.includes("404")) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [userId]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState({
    member_name: "",
    member_postion: "ACTIVE_MEMBER",
    member_profile_picture_key: "",
    member_crn: "" as string | number,
    member_urn: "" as string | number,
    member_email: "",
    member_department: "IT",
    member_semester: 1,
    member_club_department: "",
    instagram: "",
    linkedin: "",
    github: ""
  });

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  // CSV import states
  const [activeTab, setActiveTab] = useState<'single' | 'csv'>('single');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvRawRows, setCsvRawRows] = useState<any[]>([]);
  const [csvRecords, setCsvRecords] = useState<any[]>([]);
  const [unresolvedRecords, setUnresolvedRecords] = useState<any[]>([]);
  const [csvParsingError, setCsvParsingError] = useState<string | null>(null);
  const [overridePosition, setOverridePosition] = useState<string>('');
  const [isCsvDragActive, setIsCsvDragActive] = useState(false);

  // States for sub-modal edit unresolved record
  const [deleteConfirmIds, setDeleteConfirmIds] = useState<string[]>([]);
  const [unresolvedEditRecord, setUnresolvedEditRecord] = useState<any | null>(null);
  const [unresolvedEditForm, setUnresolvedEditForm] = useState({
    member_name: '',
    member_postion: '',
    member_email: '',
    member_urn: '',
    member_crn: '',
    member_department: '',
    member_semester: '' as number | string,
    member_club_department: '',
    instagram: '',
    linkedin: '',
    github: '',
    portfolio: ''
  });

  const handleCsvDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsCsvDragActive(true);
    } else if (e.type === "dragleave") {
      setIsCsvDragActive(false);
    }
  };

  const handleCsvDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCsvDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleCsvUpload(e.dataTransfer.files[0]);
    }
  };

  const handleCsvUpload = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error("Please upload a valid CSV file");
      return;
    }
    setCsvFile(file);
    setCsvParsingError(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          throw new Error("File is empty");
        }
        const rows = parseCSV(text);
        if (rows.length === 0) {
          throw new Error("No data found in CSV file");
        }

        setCsvRawRows(rows);
        const { valid, unresolved } = processCsvRows(rows, overridePosition, userId || "");
        setCsvRecords(valid);
        setUnresolvedRecords(unresolved);
      } catch (err: any) {
        setCsvParsingError(err.message || "Failed to parse CSV");
        toast.error(err.message || "Failed to parse CSV");
        setCsvRecords([]);
        setUnresolvedRecords([]);
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    if (csvRawRows.length > 0) {
      const { valid, unresolved } = processCsvRows(csvRawRows, overridePosition, userId || "");
      setCsvRecords(valid);
      setUnresolvedRecords(unresolved);
    }
  }, [overridePosition, csvRawRows, userId]);

  const handleSkipUnresolved = (id: string) => {
    setUnresolvedRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleSkipAllUnresolved = () => {
    setUnresolvedRecords([]);
  };

  const handleEditUnresolved = (record: any) => {
    setUnresolvedEditRecord(record);
    setUnresolvedEditForm({
      member_name: record.member_name || '',
      member_postion: record.member_postion || '',
      member_email: record.member_email || '',
      member_urn: record.member_urn || '',
      member_crn: record.member_crn || '',
      member_department: record.member_department || '',
      member_semester: record.member_semester !== undefined && record.member_semester !== null ? record.member_semester : '',
      member_club_department: record.member_club_department || '',
      instagram: record.socials?.instagram || '',
      linkedin: record.socials?.linkedin || '',
      github: record.socials?.github || '',
      portfolio: record.socials?.portfolio || ''
    });
  };

  const handleSaveUnresolvedEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unresolvedEditRecord) return;

    const {
      member_name,
      member_postion,
      member_email,
      member_urn,
      member_crn,
      member_department,
      member_semester,
      member_club_department,
      instagram,
      linkedin,
      github,
      portfolio
    } = unresolvedEditForm;

    if (!member_name) {
      toast.error("Name is required");
      return;
    }
    if (!member_postion) {
      toast.error("Position is required");
      return;
    }
    if (!member_email) {
      toast.error("Email is required");
      return;
    }
    if (!member_urn || isNaN(Number(member_urn))) {
      toast.error("URN must be a valid URN number");
      return;
    }
    if (!member_department) {
      toast.error("Department is required");
      return;
    }
    if (member_semester === undefined || member_semester === null || member_semester === '') {
      toast.error("Semester is required");
      return;
    }
    const sem = Number(member_semester);
    if (isNaN(sem) || sem < 1 || sem > 8) {
      toast.error("Semester must be between 1 and 8");
      return;
    }

    const socials: any = {};
    if (instagram) socials.instagram = instagram;
    if (linkedin) socials.linkedin = linkedin;
    if (github) socials.github = github;
    if (portfolio) socials.portfolio = portfolio;

    const resolvedRecord = {
      ...unresolvedEditRecord,
      member_name,
      member_postion,
      member_email,
      member_urn: Number(member_urn),
      member_crn: member_crn ? Number(member_crn) : null,
      member_department,
      member_semester: sem,
      member_club_department: member_club_department || null,
      socials
    };

    setUnresolvedRecords(prev => prev.filter(r => r.id !== unresolvedEditRecord.id));
    setCsvRecords(prev => [...prev, resolvedRecord]);
    setUnresolvedEditRecord(null);
    toast.success(`${member_name} resolved and added to import queue`);
  };

  // Cropper States
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const viewportRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error("Only JPEG and PNG images are allowed");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Original image size must be less than 10MB");
      return;
    }

    setOriginalFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCropSrc(event.target.result as string);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleCropCancel = () => {
    setCropSrc(null);
    setOriginalFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getClientCoords = (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) {
      if (e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      return null;
    }
    return { x: e.clientX, y: e.clientY };
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const coords = getClientCoords(e);
    if (!coords) return;
    setIsDragging(true);
    setDragStart({ x: coords.x - position.x, y: coords.y - position.y });
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !viewportRef.current || !imgRef.current) return;
    const coords = getClientCoords(e);
    if (!coords) return;

    const nextX = coords.x - dragStart.x;
    const nextY = coords.y - dragStart.y;

    const viewportRect = viewportRef.current.getBoundingClientRect();
    const imgRect = imgRef.current.getBoundingClientRect();

    const limitX = Math.max(0, (imgRect.width - viewportRect.width) / 2);
    const limitY = Math.max(0, (imgRect.height - viewportRect.height) / 2);

    setPosition({
      x: Math.max(-limitX, Math.min(limitX, nextX)),
      y: Math.max(-limitY, Math.min(limitY, nextY))
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleZoomChange = (nextZoom: number) => {
    if (!viewportRef.current || !imgRef.current) {
      setZoom(nextZoom);
      return;
    }

    const viewportRect = viewportRef.current.getBoundingClientRect();
    const imgRect = imgRef.current.getBoundingClientRect();

    const unzoomedW = imgRect.width / zoom;
    const unzoomedH = imgRect.height / zoom;

    const nextW = unzoomedW * nextZoom;
    const nextH = unzoomedH * nextZoom;

    const limitX = Math.max(0, (nextW - viewportRect.width) / 2);
    const limitY = Math.max(0, (nextH - viewportRect.height) / 2);

    setPosition(prev => ({
      x: Math.max(-limitX, Math.min(limitX, prev.x)),
      y: Math.max(-limitY, Math.min(limitY, prev.y))
    }));
    setZoom(nextZoom);
  };

  const handleCropConfirm = () => {
    if (!viewportRef.current || !imgRef.current || !cropSrc) return;

    const viewportRect = viewportRef.current.getBoundingClientRect();
    const imgRect = imgRef.current.getBoundingClientRect();

    const L = imgRect.left - viewportRect.left;
    const T = imgRect.top - viewportRect.top;
    const W = imgRect.width;
    const H = imgRect.height;

    const naturalWidth = imgRef.current.naturalWidth;
    const naturalHeight = imgRef.current.naturalHeight;

    const S = naturalWidth / W;

    const sourceX = -L * S;
    const sourceY = -T * S;
    const sourceWidth = viewportRect.width * S;
    const sourceHeight = viewportRect.height * S;

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 800;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        imgRef.current,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, canvas.width, canvas.height
      );
    }

    const fileType = originalFile?.type || 'image/png';

    canvas.toBlob((blob) => {
      if (blob) {
        const fileName = originalFile?.name || (editingMember ? `${editingMember.member_name.toLowerCase().replace(/\s+/g, '_')}_photo.png` : 'member_photo.png');
        const croppedFile = new File([blob], fileName, { type: fileType });
        setProfileImageFile(croppedFile);
        setPreviewUrl(URL.createObjectURL(croppedFile));
      }
      setCropSrc(null);
      setOriginalFile(null);
    }, fileType, 0.9);
  };

  const handleExistingCrop = () => {
    if (!previewUrl) return;
    setCropSrc(previewUrl);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const uploadImage = async (file: File, name: string, position: string) => {
    const ext = (file.name.split('.').pop() || 'png').toLowerCase();
    const nameSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'member';
    const posSlug = position.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'pos';
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const fileName = `${nameSlug}-${posSlug}-${uniqueId}.${ext}`;

    const { error } = await supabase.storage
      .from('profile_pictures')
      .upload(fileName, file, {
        upsert: false,
        contentType: file.type
      });

    if (error) throw error;
    return fileName;
  };

  const getPublicUrl = (key: string | undefined) => {
    if (!key) return "";
    const { data } = supabase.storage.from('profile_pictures').getPublicUrl(key);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      setIsSubmitting(true);
      if (activeTab === 'csv') {
        if (unresolvedRecords.length > 0) {
          if (!confirm(`Warning: There are still ${unresolvedRecords.length} unresolved members that will not be saved. Do you want to proceed?`)) {
            setIsSubmitting(false);
            return;
          }
        }
        if (!csvRecords || csvRecords.length === 0) {
          toast.error("No valid CSV records loaded");
          return;
        }
        await memberService.createMultipleMembers(userId, csvRecords);
        toast.success(`${csvRecords.length} members imported successfully!`);
        // Remove the CSV file state on success
        setCsvFile(null);
        setCsvRawRows([]);
        setCsvRecords([]);
        setUnresolvedRecords([]);
        setCsvParsingError(null);
        setOverridePosition('');
      } else {
        let imageKey = formData.member_profile_picture_key;
        if (profileImageFile) {
          imageKey = await uploadImage(profileImageFile, formData.member_name, formData.member_postion);
        }

        const payload = {
          member_name: formData.member_name,
          member_postion: formData.member_postion,
          member_profile_picture_key: imageKey,
          member_crn: formData.member_crn ? Number(formData.member_crn) : null,
          member_urn: Number(formData.member_urn),
          member_email: formData.member_email,
          member_department: formData.member_department,
          member_semester: Number(formData.member_semester),
          member_club_department: formData.member_club_department,
          socials: {
            instagram: formData.instagram || undefined,
            linkedin: formData.linkedin || undefined,
            github: formData.github || undefined,
          },
          created_by: userId
        };

        if (editingMember) {
          await memberService.updateMember(userId, editingMember.member_id, payload);
          toast.success("Member updated successfully!");
        } else {
          await memberService.createMember(userId, payload);
          toast.success("Member added successfully!");
        }
      }
      
      await fetchMembers();
      closeModal();
    } catch (error: any) {
      toast.error(error.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmIds([id]);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setDeleteConfirmIds(selectedIds);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredMembersList = members.filter(member => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (member.member_name && member.member_name.toLowerCase().includes(q)) ||
      (member.member_email && member.member_email.toLowerCase().includes(q)) ||
      (member.member_postion && member.member_postion.toLowerCase().replace(/_/g, ' ').includes(q)) ||
      (member.member_department && member.member_department.toLowerCase().includes(q)) ||
      (member.member_club_department && member.member_club_department.toLowerCase().includes(q)) ||
      (member.member_urn && String(member.member_urn).includes(q)) ||
      (member.member_crn && String(member.member_crn).includes(q))
    );
  });

  const selectAll = () => setSelectedIds(filteredMembersList.map(m => m.member_id));
  const unselectAll = () => setSelectedIds([]);

  const openModal = (member?: Member) => {
    setActiveTab('single');
    setCsvFile(null);
    setCsvRawRows([]);
    setCsvRecords([]);
    setUnresolvedRecords([]);
    setCsvParsingError(null);
    setOverridePosition('');
    setUnresolvedEditRecord(null);
    if (member) {
      setEditingMember(member);
      setFormData({
        member_name: member.member_name,
        member_postion: member.member_postion,
        member_profile_picture_key: member.member_profile_picture_key,
        member_crn: member.member_crn || "",
        member_urn: member.member_urn,
        member_email: member.member_email,
        member_department: member.member_department,
        member_semester: member.member_semester,
        member_club_department: member.member_club_department,
        instagram: member.socials.instagram || "",
        linkedin: member.socials.linkedin || "",
        github: member.socials.github || ""
      });
      setPreviewUrl(member.member_profile_picture_key ? getPublicUrl(member.member_profile_picture_key) : "");
    } else {
      setEditingMember(null);
      setFormData({
        member_name: "",
        member_postion: "ACTIVE_MEMBER",
        member_profile_picture_key: "",
        member_crn: "",
        member_urn: "",
        member_email: "",
        member_department: "IT",
        member_semester: 1,
        member_club_department: "",
        instagram: "",
        linkedin: "",
        github: ""
      });
      setPreviewUrl("");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
    setProfileImageFile(null);
    setPreviewUrl("");
    setIsDragActive(false);
    setShowPhotoOptions(false);
    setActiveTab('single');
    setCsvFile(null);
    setCsvRawRows([]);
    setCsvRecords([]);
    setUnresolvedRecords([]);
    setCsvParsingError(null);
    setOverridePosition('');
    setUnresolvedEditRecord(null);
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl text-gray-900 dark:text-white mb-1 sm:mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
              Club Members
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Manage English Club members and their information
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-500/30 text-xs sm:text-sm font-semibold"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                Delete Selected ({selectedIds.length})
              </button>
            )}
            <button
              onClick={() => openModal()}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-900 to-purple-700 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all text-xs sm:text-sm font-semibold"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Add Member
            </button>
          </div>
        </div>

        <div className="flex gap-4 mb-4 items-center">
          {!isSelectionMode ? (
            <button
              onClick={() => setIsSelectionMode(true)}
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
              Select
            </button>
          ) : (
            <>
              <button onClick={selectAll} className="text-sm font-semibold text-blue-600 hover:underline">Select All</button>
              <button onClick={unselectAll} className="text-sm font-semibold text-gray-500 hover:underline">Unselect All</button>
              <button
                onClick={() => {
                  setIsSelectionMode(false);
                  unselectAll();
                }}
                className="text-sm font-semibold text-red-500 hover:underline"
              >
                Cancel Selection
              </button>
            </>
          )}
        </div>

        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden min-h-[400px] flex flex-col">
          <div className="overflow-x-auto flex-1">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                   <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                   <p className="text-gray-500">Loading members...</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      {isSelectionMode && <th className="px-6 py-4 text-left w-10"></th>}
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Profile</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Position</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Dept / Sem</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">CRN</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">URN</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {filteredMembersList.map((member) => (
                      <tr key={member.member_id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${selectedIds.includes(member.member_id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                        {isSelectionMode && (
                          <td className="px-6 py-4">
                            <button onClick={() => toggleSelect(member.member_id)}>
                              {selectedIds.includes(member.member_id) ? (
                                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-300" />
                              )}
                            </button>
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                            {member.member_profile_picture_key ? (
                              <img src={getPublicUrl(member.member_profile_picture_key)} className="w-full h-full object-cover" />
                            ) : (
                              <UserIcon className="w-full h-full p-2 text-gray-400" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{member.member_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{member.member_postion.replace('_', ' ')}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{member.member_email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{member.member_department} / Sem {member.member_semester}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{member.member_crn || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{member.member_urn}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openModal(member)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(member.member_id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto" onClick={() => !isSubmitting && closeModal()}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full my-auto" 
              onClick={e => e.stopPropagation()}
            >
              <div className="p-8 border-b border-gray-250 dark:border-gray-800 flex flex-col gap-4">
                <div className="flex justify-between items-center w-full">
                  <h2 className="text-2xl font-bold">{editingMember ? "Edit Member" : "Add New Member"}</h2>
                  <button 
                    type="button" 
                    onClick={closeModal} 
                    disabled={isSubmitting} 
                    className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                {!editingMember && (
                  <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 w-full max-w-xs border border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => setActiveTab('single')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        activeTab === 'single'
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-500 hover:text-gray-950 dark:hover:text-white'
                      }`}
                    >
                      Single Member
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('csv')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        activeTab === 'csv'
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-500 hover:text-gray-950 dark:hover:text-white'
                      }`}
                    >
                      Bulk Import (CSV)
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {activeTab === 'csv' ? (
                  <div className="space-y-6">
                    {/* CSV Drag & Drop Box */}
                    <div
                      onDragEnter={handleCsvDrag}
                      onDragOver={handleCsvDrag}
                      onDragLeave={handleCsvDrag}
                      onDrop={handleCsvDrop}
                      className={`relative group rounded-2xl border-2 border-dashed p-8 transition-all flex flex-col items-center justify-center gap-3 text-center cursor-pointer ${
                        isCsvDragActive
                          ? 'border-blue-500 bg-blue-500/5 dark:bg-blue-500/10'
                          : csvFile
                            ? 'border-green-500 bg-green-500/5 dark:bg-green-500/10'
                            : 'border-gray-300 dark:border-gray-700 hover:border-blue-400'
                      }`}
                      onClick={() => document.getElementById('csv-file-input')?.click()}
                    >
                      <input
                        id="csv-file-input"
                        type="file"
                        className="hidden"
                        accept=".csv"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleCsvUpload(file);
                        }}
                      />
                      <Plus className={`w-10 h-10 ${csvFile ? 'text-green-500' : 'text-gray-400 group-hover:text-blue-500'} transition-colors`} />
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {csvFile ? csvFile.name : "Drag & Drop CSV file here"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {csvFile ? `${csvRecords.length} records parsed successfully` : "or click to browse your computer"}
                        </p>
                      </div>
                      {csvFile && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCsvFile(null);
                            setCsvRawRows([]);
                            setCsvRecords([]);
                            setUnresolvedRecords([]);
                            setCsvParsingError(null);
                            setOverridePosition('');
                            const input = document.getElementById('csv-file-input') as HTMLInputElement;
                            if (input) input.value = '';
                          }}
                          className="mt-2 text-xs font-bold text-red-500 hover:text-red-700 border border-red-250 dark:border-red-800 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900 transition-colors shadow-sm"
                        >
                          Remove File
                        </button>
                      )}
                    </div>

                    {csvParsingError && (
                      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm">
                        <strong>Parsing Error:</strong> {csvParsingError}
                      </div>
                    )}

                    {/* Position Override Select */}
                    {csvFile && (
                      <div className="grid md:grid-cols-2 gap-4 items-end bg-gray-900 dark:bg-gray-950 p-4 rounded-2xl border border-gray-800 dark:border-gray-800">
                        <div>
                          <label className="block text-xs font-semibold mb-2 text-gray-200 dark:text-white">
                            Override Position (Optional)
                          </label>
                          <select
                            value={overridePosition}
                            onChange={(e) => setOverridePosition(e.target.value)}
                            className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-750 dark:border-gray-800 bg-gray-800 dark:bg-gray-900 text-white dark:text-white"
                          >
                            <option value="">Use positions from CSV</option>
                            <option value="CONVENOR">Convenor</option>
                            <option value="CO-CONVENOR">Co-Convenor</option>
                            <option value="TECHNICAL_HEAD">Technical Head</option>
                            <option value="CO-TECHNICAL_HEAD">Co-Technical Head</option>
                            <option value="FINANCE_&_AI_HEAD">Finance & AI Head</option>
                            <option value="CO-FINANCE_&_AI_HEAD">Co-Finance & AI Head</option>
                            <option value="DISCIPLINE_HEAD">Discipline Head</option>
                            <option value="CO-DISCIPLINE_HEAD">Co-Discipline Head</option>
                            <option value="DOCUMENTATION_HEAD">Documentation Head</option>
                            <option value="CO-DOCUMENTATION_HEAD">Co-Documentation Head</option>
                            <option value="EVENT_MANAGEMENT_HEAD">Event Management Head</option>
                            <option value="CO-EVENT_MANAGEMENT_HEAD">Co-Event Management Head</option>
                            <option value="CREATIVE_HEAD">Creative Head</option>
                            <option value="CO-CREATIVE_HEAD">Co-Creative Head</option>
                            <option value="PROMOTION_HEAD">Promotion Head</option>
                            <option value="CO-PROMOTION_HEAD">Co-Promotion Head</option>
                            <option value="SOCIAL_MEDIA_HEAD">Social Media Head</option>
                            <option value="CO-SOCIAL_MEDIA_HEAD">Co-Social Media Head</option>
                            <option value="ANCHORING_HEAD">Anchoring Head</option>
                            <option value="CO-ANCHORING_HEAD">Co-Anchoring Head</option>
                            <option value="PHOTOGRAPHY_&_VIDEOGRAPHY_HEAD">Photography & Videography Head</option>
                            <option value="CO-PHOTOGRAPHY_&_VIDEOGRAPHY_HEAD">Co-Photography & Videography Head</option>
                            <option value="EXECUTIVE_MEMBER">Executive Member</option>
                            <option value="ACTIVE_MEMBER">Active Member</option>
                          </select>
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {overridePosition ? (
                            <span className="text-amber-200 font-bold block bg-amber-950/40 p-2 rounded-lg border border-amber-900/50">
                              ⚠️ Selecting a position here overrides all CSV positions to this value.
                            </span>
                          ) : (
                            <span className="block p-2 text-gray-400 italic">
                              Members will use the position specified in their CSV row.
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Unresolved Records review list panel */}
                    {csvFile && unresolvedRecords.length > 0 && (
                      <div className="space-y-3 p-5 rounded-2xl bg-red-50/50 dark:bg-red-950/5 border border-red-200/60 dark:border-red-950/40">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-bold text-sm text-red-700 dark:text-red-400">Unresolved Records (Needs Review)</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              The following members will not be saved due to format errors or missing data.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleSkipAllUnresolved}
                            className="text-xs font-semibold bg-red-100 hover:bg-red-200 dark:bg-red-950/30 text-red-700 dark:text-red-400 px-3 py-1.5 rounded-lg transition-colors border border-red-200 dark:border-red-900/50"
                          >
                            Skip All
                          </button>
                        </div>
                        <div className="max-h-60 overflow-y-auto border border-red-200/50 dark:border-red-950/30 rounded-xl">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-red-50 dark:bg-red-950/20 sticky top-0 border-b border-red-200/30">
                              <tr>
                                <th className="p-3 text-red-800 dark:text-red-400">Name</th>
                                <th className="p-3 text-red-800 dark:text-red-400">Class+Section</th>
                                <th className="p-3 text-red-800 dark:text-red-400">Reason</th>
                                <th className="p-3 text-red-800 dark:text-red-400 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-red-100/50 dark:divide-red-950/20">
                              {unresolvedRecords.map((rec) => (
                                <tr key={rec.id} className="hover:bg-red-50/30">
                                  <td className="p-3 font-medium text-gray-900 dark:text-white">{rec.member_name || 'Unknown'}</td>
                                  <td className="p-3 text-gray-600 dark:text-gray-400">{rec.rawClassSection || 'Missing'}</td>
                                  <td className="p-3 text-red-600 dark:text-red-400 font-semibold">{rec.reason}</td>
                                  <td className="p-3 text-right">
                                    <div className="flex justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleEditUnresolved(rec)}
                                        className="px-2.5 py-1 text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleSkipUnresolved(rec.id)}
                                        className="px-2.5 py-1 text-[10px] font-bold bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-350 rounded transition-colors"
                                      >
                                        Skip
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {csvRecords.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300">Parsed Preview</h3>
                          <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2.5 py-0.5 rounded-full font-semibold">
                            {csvRecords.length} members
                          </span>
                        </div>
                        <div className="max-h-60 overflow-y-auto border border-gray-250 dark:border-gray-850 rounded-xl">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 border-b border-gray-200 dark:border-gray-700">
                              <tr>
                                <th className="p-3">Name</th>
                                <th className="p-3">Position</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Dept/Sem</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-150 dark:divide-gray-800">
                              {csvRecords.map((rec, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-850/50">
                                  <td className="p-3 font-medium text-gray-900 dark:text-white">{rec.member_name}</td>
                                  <td className="p-3 text-gray-600 dark:text-gray-400">{rec.member_postion?.replace(/_/g, ' ')}</td>
                                  <td className="p-3 text-gray-600 dark:text-gray-400">{rec.member_email}</td>
                                  <td className="p-3 text-gray-600 dark:text-gray-400">{rec.member_department} / Sem {rec.member_semester}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* CSV Instructions Card */}
                    <div className="p-5 rounded-2xl bg-gray-900 dark:bg-gray-950 border border-gray-800 dark:border-gray-800 text-xs space-y-2">
                      <p className="font-bold text-gray-200 dark:text-gray-300">CSV Column Requirements:</p>
                      <ul className="list-disc list-inside space-y-1 text-gray-400">
                        <li><strong className="text-gray-300 dark:text-gray-300">Required fields:</strong> Name, Class+Section, URN, E-MAIL</li>
                        <li><strong className="text-gray-300 dark:text-gray-300">Optional fields:</strong> CRN, Position, LinkedIn Profile Link, Github Profile Link, Portfolio Link</li>
                        <li>Class+Section parses year from <code className="bg-gray-800 dark:bg-gray-900 px-1 py-0.5 rounded text-gray-300 dark:text-gray-300">D2 ME A</code> etc. (Semester = Year * 2 - 1).</li>
                      </ul>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        disabled={isSubmitting}
                        className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || csvRecords.length === 0}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-900 to-purple-700 text-white font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Importing...</span>
                          </>
                        ) : (
                          `Import ${csvRecords.length} Members`
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col items-center gap-4">
                      <div 
                        className={`relative group rounded-2xl border-2 border-dashed transition-all ${
                          isDragActive 
                            ? 'border-purple-500 bg-purple-500/10 scale-105 shadow-lg' 
                            : 'border-transparent'
                        }`}
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                      >
                        <div className="w-32 h-40 rounded-2xl border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center shadow-md">
                          {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : <UserIcon className="w-10 h-10 text-gray-400" />}
                        </div>
                        {previewUrl ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setShowPhotoOptions(true);
                            }}
                            className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            {editingMember ? <Edit2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                          </button>
                        ) : (
                          <label className={`absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-2xl cursor-pointer transition-opacity ${
                            isDragActive ? 'opacity-100 bg-purple-950/60' : 'opacity-0 group-hover:opacity-100'
                          }`}>
                            <Plus className={`w-6 h-6 ${isDragActive ? 'animate-bounce text-purple-200' : ''}`} />
                            <input ref={fileInputRef} type="file" className="hidden" accept="image/jpeg,image/png" onChange={handleFileChange} />
                          </label>
                        )}
                        <input ref={fileInputRef} type="file" className="hidden" accept="image/jpeg,image/png" onChange={handleFileChange} />
                        
                        <AnimatePresence>
                          {previewUrl && showPhotoOptions && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="absolute inset-0 bg-black/90 rounded-2xl flex flex-col justify-center gap-1.5 p-2.5 z-10"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setShowPhotoOptions(false);
                                  handleExistingCrop();
                                }}
                                className="w-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white py-1.5 rounded-lg transition-colors cursor-pointer border border-white/10"
                              >
                                Crop
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowPhotoOptions(false);
                                  fileInputRef.current?.click();
                                }}
                                className="w-full text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg transition-colors cursor-pointer"
                              >
                                Upload New
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowPhotoOptions(false)}
                                className="w-full text-[10px] text-gray-400 hover:text-white mt-0.5 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">
                        {isDragActive ? "Drop image here" : "Profile Picture"}
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Full Name</label>
                        <input type="text" required value={formData.member_name} onChange={e => setFormData({...formData, member_name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Position</label>
                        <select value={formData.member_postion} onChange={e => setFormData({...formData, member_postion: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
                          <option value="CONVENOR">Convenor</option>
                          <option value="CO-CONVENOR">Co-Convenor</option>
                          <option value="TECHNICAL_HEAD">Technical Head</option>
                          <option value="CO-TECHNICAL_HEAD">Co-Technical Head</option>
                          <option value="FINANCE_&_AI_HEAD">Finance & AI Head</option>
                          <option value="CO-FINANCE_&_AI_HEAD">Co-Finance & AI Head</option>
                          <option value="DISCIPLINE_HEAD">Discipline Head</option>
                          <option value="CO-DISCIPLINE_HEAD">Co-Discipline Head</option>
                          <option value="DOCUMENTATION_HEAD">Documentation Head</option>
                          <option value="CO-DOCUMENTATION_HEAD">Co-Documentation Head</option>
                          <option value="EVENT_MANAGEMENT_HEAD">Event Management Head</option>
                          <option value="CO-EVENT_MANAGEMENT_HEAD">Co-Event Management Head</option>
                          <option value="CREATIVE_HEAD">Creative Head</option>
                          <option value="CO-CREATIVE_HEAD">Co-Creative Head</option>
                          <option value="PROMOTION_HEAD">Promotion Head</option>
                          <option value="CO-PROMOTION_HEAD">Co-Promotion Head</option>
                          <option value="SOCIAL_MEDIA_HEAD">Social Media Head</option>
                          <option value="CO-SOCIAL_MEDIA_HEAD">Co-Social Media Head</option>
                          <option value="ANCHORING_HEAD">Anchoring Head</option>
                          <option value="CO-ANCHORING_HEAD">Co-Anchoring Head</option>
                          <option value="PHOTOGRAPHY_&_VIDEOGRAPHY_HEAD">Photography & Videography Head</option>
                          <option value="CO-PHOTOGRAPHY_&_VIDEOGRAPHY_HEAD">Co-Photography & Videography Head</option>
                          <option value="EXECUTIVE_MEMBER">Executive Member</option>
                          <option value="ACTIVE_MEMBER">Active Member</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Email</label>
                        <input type="email" required value={formData.member_email} onChange={e => setFormData({...formData, member_email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">URN</label>
                        <input type="number" required value={formData.member_urn} onChange={e => setFormData({...formData, member_urn: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Dept</label>
                        <select value={formData.member_department} onChange={e => setFormData({...formData, member_department: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
                          {['IT', 'CSE', 'ECE', 'CE', 'ME', 'BBA', 'BCA'].map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Sem</label>
                        <input type="number" min="1" max="8" value={formData.member_semester} onChange={e => setFormData({...formData, member_semester: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">CRN</label>
                        <input type="number" value={formData.member_crn} onChange={e => setFormData({...formData, member_crn: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" />
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <h3 className="font-bold flex items-center gap-2"><Instagram className="w-4 h-4" /> Socials</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <input type="text" placeholder="Instagram URL" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} className="px-4 py-2 rounded-lg border border-gray-200 text-sm" />
                        <input type="text" placeholder="LinkedIn URL" value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} className="px-4 py-2 rounded-lg border border-gray-200 text-sm" />
                        <input type="text" placeholder="GitHub URL" value={formData.github} onChange={e => setFormData({...formData, github: e.target.value})} className="px-4 py-2 rounded-lg border border-gray-200 text-sm" />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        type="button" 
                        onClick={closeModal} 
                        disabled={isSubmitting} 
                        className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-900 to-purple-700 text-white font-bold hover:shadow-lg transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          editingMember ? "Update Member" : "Add Member"
                        )}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

        {/* Sub-modal inline edit unresolved record */}
        {unresolvedEditRecord && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-6 overflow-y-auto" onClick={() => setUnresolvedEditRecord(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-3xl max-w-xl w-full my-auto border border-gray-200 dark:border-gray-800 shadow-2xl" 
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-950 dark:text-white">Resolve Member Details</h3>
                  <p className="text-xs text-red-500 mt-1">
                    <strong>Error:</strong> {unresolvedEditRecord.reason}
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setUnresolvedEditRecord(null)}
                  className="p-2 hover:bg-gray-150 dark:hover:bg-gray-800 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSaveUnresolvedEdit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      value={unresolvedEditForm.member_name} 
                      onChange={e => setUnresolvedEditForm({...unresolvedEditForm, member_name: e.target.value})} 
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Position</label>
                    <select 
                      value={unresolvedEditForm.member_postion} 
                      onChange={e => setUnresolvedEditForm({...unresolvedEditForm, member_postion: e.target.value})} 
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Position</option>
                      <option value="CONVENOR">Convenor</option>
                      <option value="CO-CONVENOR">Co-Convenor</option>
                      <option value="TECHNICAL_HEAD">Technical Head</option>
                      <option value="CO-TECHNICAL_HEAD">Co-Technical Head</option>
                      <option value="FINANCE_&_AI_HEAD">Finance & AI Head</option>
                      <option value="CO-FINANCE_&_AI_HEAD">Co-Finance & AI Head</option>
                      <option value="DISCIPLINE_HEAD">Discipline Head</option>
                      <option value="CO-DISCIPLINE_HEAD">Co-Discipline Head</option>
                      <option value="DOCUMENTATION_HEAD">Documentation Head</option>
                      <option value="CO-DOCUMENTATION_HEAD">Co-Documentation Head</option>
                      <option value="EVENT_MANAGEMENT_HEAD">Event Management Head</option>
                      <option value="CO-EVENT_MANAGEMENT_HEAD">Co-Event Management Head</option>
                      <option value="CREATIVE_HEAD">Creative Head</option>
                      <option value="CO-CREATIVE_HEAD">Co-Creative Head</option>
                      <option value="PROMOTION_HEAD">Promotion Head</option>
                      <option value="CO-PROMOTION_HEAD">Co-Promotion Head</option>
                      <option value="SOCIAL_MEDIA_HEAD">Social Media Head</option>
                      <option value="CO-SOCIAL_MEDIA_HEAD">Co-Social Media Head</option>
                      <option value="ANCHORING_HEAD">Anchoring Head</option>
                      <option value="CO-ANCHORING_HEAD">Co-Anchoring Head</option>
                      <option value="PHOTOGRAPHY_&_VIDEOGRAPHY_HEAD">Photography & Videography Head</option>
                      <option value="CO-PHOTOGRAPHY_&_VIDEOGRAPHY_HEAD">Co-Photography & Videography Head</option>
                      <option value="EXECUTIVE_MEMBER">Executive Member</option>
                      <option value="ACTIVE_MEMBER">Active Member</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Email</label>
                    <input 
                      type="email" 
                      required 
                      value={unresolvedEditForm.member_email} 
                      onChange={e => setUnresolvedEditForm({...unresolvedEditForm, member_email: e.target.value})} 
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">URN</label>
                    <input 
                      type="number" 
                      required 
                      value={unresolvedEditForm.member_urn} 
                      onChange={e => setUnresolvedEditForm({...unresolvedEditForm, member_urn: e.target.value})} 
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Dept</label>
                    <select 
                      value={unresolvedEditForm.member_department} 
                      onChange={e => setUnresolvedEditForm({...unresolvedEditForm, member_department: e.target.value})} 
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Dept</option>
                      {['IT', 'CSE', 'RAI', 'ECE', 'CE', 'EE', 'ME', 'BBA', 'BCA'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Sem</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="8" 
                      value={unresolvedEditForm.member_semester} 
                      onChange={e => setUnresolvedEditForm({...unresolvedEditForm, member_semester: e.target.value === '' ? '' : Number(e.target.value)})} 
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">CRN</label>
                    <input 
                      type="number" 
                      value={unresolvedEditForm.member_crn} 
                      onChange={e => setUnresolvedEditForm({...unresolvedEditForm, member_crn: e.target.value})} 
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                    />
                  </div>
                </div>

                <div>
                   <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Club Dept</label>
                   <input 
                     type="text" 
                     value={unresolvedEditForm.member_club_department} 
                     onChange={e => setUnresolvedEditForm({...unresolvedEditForm, member_club_department: e.target.value})} 
                     placeholder="e.g. Technical Department" 
                     className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                   />
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="font-semibold text-xs text-gray-800 dark:text-gray-200">Socials</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="LinkedIn URL" 
                      value={unresolvedEditForm.linkedin} 
                      onChange={e => setUnresolvedEditForm({...unresolvedEditForm, linkedin: e.target.value})} 
                      className="px-3 py-1.5 rounded-lg border border-gray-800 dark:border-gray-800 text-xs text-white dark:text-white bg-gray-900 dark:bg-gray-950" 
                    />
                    <input 
                      type="text" 
                      placeholder="GitHub URL" 
                      value={unresolvedEditForm.github} 
                      onChange={e => setUnresolvedEditForm({...unresolvedEditForm, github: e.target.value})} 
                      className="px-3 py-1.5 rounded-lg border border-gray-800 dark:border-gray-800 text-xs text-white dark:text-white bg-gray-900 dark:bg-gray-950" 
                    />
                    <input 
                      type="text" 
                      placeholder="Instagram URL" 
                      value={unresolvedEditForm.instagram} 
                      onChange={e => setUnresolvedEditForm({...unresolvedEditForm, instagram: e.target.value})} 
                      className="px-3 py-1.5 rounded-lg border border-gray-800 dark:border-gray-800 text-xs text-white dark:text-white bg-gray-900 dark:bg-gray-950" 
                    />
                    <input 
                      type="text" 
                      placeholder="Portfolio URL" 
                      value={unresolvedEditForm.portfolio} 
                      onChange={e => setUnresolvedEditForm({...unresolvedEditForm, portfolio: e.target.value})} 
                      className="px-3 py-1.5 rounded-lg border border-gray-800 dark:border-gray-800 text-xs text-white dark:text-white bg-gray-900 dark:bg-gray-950" 
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button 
                    type="button" 
                    onClick={() => setUnresolvedEditRecord(null)}
                    className="flex-1 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-850 text-xs"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-900 to-purple-700 text-white font-bold hover:shadow-lg text-xs"
                  >
                    Save & Add
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

      <AnimatePresence>
        {cropSrc && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-6 overflow-y-auto" onClick={handleCropCancel}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-[2rem] max-w-xl w-full p-8 shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col items-center gap-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-full text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Crop Profile Picture
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Drag the image to position and use the slider to zoom.
                </p>
              </div>

              {/* Viewport Box (4:5 Aspect Ratio) */}
              <div
                ref={viewportRef}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
                className="relative overflow-hidden w-full aspect-[4/5] bg-gray-100 dark:bg-gray-800 rounded-2xl cursor-move select-none border border-gray-250 dark:border-gray-700 flex items-center justify-center shadow-inner"
              >
                <img
                  ref={imgRef}
                  src={cropSrc}
                  alt="Crop preview"
                  crossOrigin="anonymous"
                  draggable={false}
                  style={{
                    transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${zoom})`,
                    transformOrigin: "center",
                    transition: isDragging ? "none" : "transform 0.1s ease-out",
                  }}
                  className="max-w-none max-h-none pointer-events-none select-none min-w-full min-h-full object-cover"
                />

                {/* 3x3 Grid Overlay */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none rounded-2xl overflow-hidden">
                  <div className="border-r border-b border-white/20"></div>
                  <div className="border-r border-b border-white/20"></div>
                  <div className="border-b border-white/20"></div>
                  <div className="border-r border-b border-white/20"></div>
                  <div className="border-r border-b border-white/20"></div>
                  <div className="border-b border-white/20"></div>
                  <div className="border-r border-white/20"></div>
                  <div className="border-r border-white/20"></div>
                  <div></div>
                </div>

                {/* Crop border overlay */}
                <div className="absolute inset-0 border-2 border-dashed border-purple-500/50 rounded-2xl pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"></div>
              </div>

              {/* Zoom Controls */}
              <div className="w-full flex items-center gap-4 py-2">
                <ZoomOut className="w-5 h-5 text-gray-400" />
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  value={zoom}
                  onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600 focus:outline-none"
                />
                <ZoomIn className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-semibold text-gray-500 w-10 text-right">
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              {/* Actions */}
              <div className="w-full flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleCropCancel}
                  className="flex-1 px-6 py-3.5 rounded-xl border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCropConfirm}
                  className="flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-900 to-purple-700 text-white font-bold hover:shadow-lg transition-all text-sm"
                >
                  Apply Crop
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirmIds.length > 0 && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-6"
            onClick={() => setDeleteConfirmIds([])}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center gap-6" 
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-600 dark:text-red-400">
                <Trash2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Member</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {deleteConfirmIds.length === 1 
                    ? "Are you sure you want to delete this member? This action cannot be undone."
                    : `Are you sure you want to delete these ${deleteConfirmIds.length} members? This action cannot be undone.`}
                </p>
              </div>
              <div className="flex gap-4 w-full">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmIds([])}
                  className="flex-1 px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-850 text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const idsToDelete = deleteConfirmIds;
                    setDeleteConfirmIds([]);
                    if (!userId) return;
                    try {
                      await memberService.deleteMembers(userId, idsToDelete);
                      if (idsToDelete.length === 1) {
                        toast.success("Member deleted successfully!");
                      } else {
                        toast.success(`${idsToDelete.length} members deleted successfully!`);
                        setSelectedIds([]);
                      }
                      await fetchMembers();
                    } catch (error: any) {
                      toast.error(error.message || "Failed to delete member(s)");
                    }
                  }}
                  className="flex-1 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-lg shadow-red-500/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
