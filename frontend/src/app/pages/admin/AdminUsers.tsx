import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  User as UserIcon,
  Check,
  Search,
  Shield,
  Key,
  Users,
  CheckSquare,
  Square,
  Lock,
  Sparkles,
  Layers,
  Info,
  Filter,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../../services/userService";
import { memberService } from "../../../services/memberService";
import { roleService, Role, ALL_PANELS } from "../../../services/roleService";
import { supabase } from "../../../lib/supabase";
import { useAdminSearch } from "../../context/AdminSearchContext";

interface User {
  id: number;
  member_id: string;
  name: string;
  role: string;
  profilePicture?: string;
  memberName?: string;
  memberClubDepartment?: string;
}

interface Member {
  member_id: string;
  member_name: string;
  member_email: string;
  member_profile_picture_key: string;
  member_club_department?: string;
}

export function AdminUsers() {
  const { userId, logout } = useAuth();
  const { searchQuery, setSearchPlaceholder } = useAdminSearch();

  // Active Tab: 'users' or 'roles'
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users");

  // User Accounts State
  const [users, setUsers] = useState<User[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(true);

  // User Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userStep, setUserStep] = useState<1 | 2>(1); // 1: Select Member, 2: Account Details
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [deleteUserConfirmId, setDeleteUserConfirmId] = useState<number | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [filterRole, setFilterRole] = useState<string>("ALL");
  const [deleteMultipleConfirm, setDeleteMultipleConfirm] = useState(false);
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);
  const [userFormData, setUserFormData] = useState({
    username: "",
    password: "",
    role: "MANAGER",
    department: "TECHNICAL",
  });

  // Role Modal State
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleFormData, setRoleFormData] = useState<{
    role_name: string;
    description: string;
    permissions: string[];
  }>({
    role_name: "",
    description: "",
    permissions: [],
  });
  const [isSavingRole, setIsSavingRole] = useState(false);
  const [deleteRoleConfirm, setDeleteRoleConfirm] = useState<Role | null>(null);

  // Dynamic Search Placeholder and reset selection based on active tab
  useEffect(() => {
    setSelectedUserIds([]);
    setIsSelectionMode(false);
    if (activeTab === "users") {
      setSearchPlaceholder("Search user accounts by username, member name, role...");
    } else {
      setSearchPlaceholder("Search roles by name or description...");
    }
  }, [activeTab, setSearchPlaceholder]);

  // Fetch Users
  const fetchUsers = async () => {
    if (!userId) return;
    try {
      setLoadingUsers(true);
      const data = await userService.getUsers(userId);
      const mappedUsers = data.map((u: any) => ({
        id: u.user_id,
        member_id: u.member_id,
        name: u.user_name,
        role: u.user_role,
        profilePicture: u.members?.member_profile_picture_key,
        memberName: u.members?.member_name,
        memberEmail: u.members?.member_email,
        memberClubDepartment: u.members?.member_club_department,
      }));
      setUsers(sortUsersByRole(mappedUsers));
    } catch (error: any) {
      toast.error("Failed to fetch users");
      if (error.message && error.message.includes("404")) {
        logout();
      }
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch Roles
  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);
      const data = await roleService.getRoles();
      setRoles(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch roles");
    } finally {
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [userId]);

  // --- USER ACCOUNT ACTIONS ---
  const openAddUserModal = async () => {
    if (!userId) return;
    try {
      const memberData = await memberService.getAllMembers();
      setMembers(memberData);
      setUserStep(1);
      setSelectedMember(null);
      setEditingUser(null);
      setUserFormData({
        username: "",
        password: "",
        role: roles[0]?.role_name || "MANAGER",
        department: "TECHNICAL",
      });
      setIsUserModalOpen(true);
    } catch (error) {
      toast.error("Failed to fetch members list");
    }
  };

  const openEditUserModal = (user: User) => {
    setEditingUser(user);
    setSelectedMember({
      member_id: user.member_id,
      member_name: user.name,
      member_email: "",
      member_profile_picture_key: user.profilePicture || "",
      member_club_department: user.memberClubDepartment,
    });
    setUserFormData({
      username: user.name,
      password: "",
      role: user.role,
      department: user.memberClubDepartment || "TECHNICAL",
    });
    setUserStep(2);
    setIsUserModalOpen(true);
  };

  const handleSelectMember = (member: Member) => {
    const alreadyHasAccount = users.some((u) => u.member_id === member.member_id);
    if (alreadyHasAccount) {
      toast.error("This member already has a user account");
      return;
    }
    setSelectedMember(member);
    setUserFormData({
      ...userFormData,
      username: member.member_name.toLowerCase().replace(/\s+/g, "_"),
      department: member.member_club_department || "TECHNICAL",
    });
    setUserStep(2);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !selectedMember) return;

    try {
      setIsSavingUser(true);
      if (editingUser) {
        const payload: any = {
          user_name: userFormData.username,
          user_role: userFormData.role,
        };
        if (userFormData.password) {
          payload.user_password = userFormData.password;
        }
        await userService.updateUser(String(editingUser.id), payload);
        if (userFormData.role === "INTERVIEWEE" && userFormData.department) {
          await memberService.updateMember(userId, selectedMember.member_id, {
            member_club_department: userFormData.department,
          });
        }
        toast.success("User account updated successfully!");
      } else {
        const payload = {
          user_name: userFormData.username,
          user_password: userFormData.password,
          user_role: userFormData.role,
          member_id: selectedMember.member_id,
        };
        await userService.createUser(userId, payload);
        if (userFormData.role === "INTERVIEWEE" && userFormData.department) {
          await memberService.updateMember(userId, selectedMember.member_id, {
            member_club_department: userFormData.department,
          });
        }
        toast.success("User account created successfully!");
      }
      await fetchUsers();
      closeUserModal();
    } catch (error: any) {
      toast.error(error.message || "Failed to save user account");
    } finally {
      setIsSavingUser(false);
    }
  };

  const closeUserModal = () => {
    setIsUserModalOpen(false);
    setUserStep(1);
    setSelectedMember(null);
    setEditingUser(null);
  };

  const handleToggleSelectUser = (id: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllUsers = () => {
    setSelectedUserIds(filteredUsers.map((u) => u.id));
  };

  const handleUnselectAllUsers = () => {
    setSelectedUserIds([]);
  };

  const handleDeleteMultipleUsersConfirm = async () => {
    if (!userId || selectedUserIds.length === 0) return;
    try {
      setIsDeletingMultiple(true);
      await userService.deleteMultipleUsers(userId, selectedUserIds);
      toast.success(`${selectedUserIds.length} user account(s) deleted successfully!`);
      setSelectedUserIds([]);
      setIsSelectionMode(false);
      setDeleteMultipleConfirm(false);
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete selected users");
    } finally {
      setIsDeletingMultiple(false);
    }
  };

  // --- ROLE ACTIONS ---
  const openCreateRoleModal = () => {
    setEditingRole(null);
    setRoleFormData({
      role_name: "",
      description: "",
      permissions: [],
    });
    setIsRoleModalOpen(true);
  };

  const openEditRoleModal = (role: Role) => {
    setEditingRole(role);
    setRoleFormData({
      role_name: role.role_name,
      description: role.description || "",
      permissions: [...role.permissions],
    });
    setIsRoleModalOpen(true);
  };

  const togglePermission = (permId: string) => {
    setRoleFormData((prev) => {
      const exists = prev.permissions.includes(permId);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((p) => p !== permId)
          : [...prev.permissions, permId],
      };
    });
  };

  const togglePanelPermissions = (panelKey: string) => {
    const panel = ALL_PANELS.find((p) => p.key === panelKey);
    if (!panel) return;
    const panelPermIds = panel.permissions.map((p) => p.id);
    const hasAll = panelPermIds.every((id) => roleFormData.permissions.includes(id));

    setRoleFormData((prev) => ({
      ...prev,
      permissions: hasAll
        ? prev.permissions.filter((id) => !panelPermIds.includes(id))
        : Array.from(new Set([...prev.permissions, ...panelPermIds])),
    }));
  };

  const selectAllPermissions = () => {
    const allPerms = ALL_PANELS.flatMap((panel) => panel.permissions.map((p) => p.id));
    setRoleFormData((prev) => ({
      ...prev,
      permissions: allPerms,
    }));
  };

  const deselectAllPermissions = () => {
    setRoleFormData((prev) => ({
      ...prev,
      permissions: [],
    }));
  };

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleFormData.role_name.trim()) {
      toast.error("Role name is required");
      return;
    }

    try {
      setIsSavingRole(true);
      if (editingRole && editingRole.role_id) {
        await roleService.updateRole(editingRole.role_id, {
          description: roleFormData.description,
          permissions: roleFormData.permissions,
        });
        toast.success(`Role "${editingRole.role_name}" updated successfully!`);
      } else {
        await roleService.createRole({
          role_name: roleFormData.role_name.trim().toUpperCase(),
          description: roleFormData.description,
          permissions: roleFormData.permissions,
        });
        toast.success(`Role "${roleFormData.role_name.trim().toUpperCase()}" created successfully!`);
      }
      await fetchRoles();
      setIsRoleModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save role");
    } finally {
      setIsSavingRole(false);
    }
  };

  const handleDeleteRoleConfirm = async () => {
    if (!deleteRoleConfirm || !deleteRoleConfirm.role_id) return;
    try {
      await roleService.deleteRole(deleteRoleConfirm.role_id);
      toast.success(`Role "${deleteRoleConfirm.role_name}" deleted successfully!`);
      setDeleteRoleConfirm(null);
      await fetchRoles();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete role");
    }
  };

  const getPublicUrl = (key: string | undefined) => {
    if (!key) return "";
    const { data } = supabase.storage.from("profile_pictures").getPublicUrl(key);
    return data.publicUrl;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "MASTER":
        return "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800";
      case "ADMIN":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800";
      case "MANAGER":
        return "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300 border border-green-300 dark:border-green-800";
      case "INTERVIEWEE":
        return "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-300 dark:border-orange-800";
      default:
        return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800";
    }
  };

  const getRoleRank = (role?: string): number => {
    const r = (role || "").toUpperCase();
    switch (r) {
      case "MASTER":
        return 1;
      case "ADMIN":
        return 2;
      case "MANAGER":
        return 3;
      case "INTERVIEWEE":
        return 5;
      default:
        return 4; // Custom roles (e.g. PARTICIPANT_SORTER)
    }
  };

  const sortUsersByRole = (userList: User[]): User[] => {
    return [...userList].sort((a, b) => {
      const rankA = getRoleRank(a.role);
      const rankB = getRoleRank(b.role);
      if (rankA !== rankB) {
        return rankA - rankB;
      }
      const roleA = (a.role || "").toUpperCase();
      const roleB = (b.role || "").toUpperCase();
      if (roleA !== roleB) {
        return roleA.localeCompare(roleB);
      }
      const nameA = a.memberName || a.name || "";
      const nameB = b.memberName || b.name || "";
      return nameA.localeCompare(nameB);
    });
  };

  const availableRoleOptions = Array.from(
    new Set([
      "MASTER",
      "ADMIN",
      "MANAGER",
      ...roles.map((r) => r.role_name.toUpperCase()),
      "INTERVIEWEE",
      ...users.map((u) => u.role?.toUpperCase()).filter(Boolean),
    ])
  ).sort((a, b) => {
    const rankA = getRoleRank(a);
    const rankB = getRoleRank(b);
    if (rankA !== rankB) return rankA - rankB;
    return a.localeCompare(b);
  });

  const filteredMembers = members.filter(
    (m) =>
      m.member_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      m.member_email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const filteredUsers = sortUsersByRole(
    users.filter((u) => {
      const matchesRole =
        filterRole === "ALL" ||
        (u.role && u.role.toUpperCase() === filterRole.toUpperCase());
      if (!matchesRole) return false;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.memberName && u.memberName.toLowerCase().includes(q)) ||
        (u.role && u.role.toLowerCase().includes(q)) ||
        (u.memberClubDepartment && u.memberClubDepartment.toLowerCase().includes(q))
      );
    })
  );

  const filteredRoles = roles.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (r.role_name && r.role_name.toLowerCase().includes(q)) ||
      (r.description && r.description.toLowerCase().includes(q))
    );
  });

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Top Header & Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
              User & Role Management
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage user login credentials, system roles, and custom granular permissions
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {activeTab === "users" ? (
              <>
                {selectedUserIds.length > 0 && (
                  <button
                    onClick={() => setDeleteMultipleConfirm(true)}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Selected ({selectedUserIds.length})
                  </button>
                )}
                <button
                  onClick={openAddUserModal}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-900 to-purple-700 text-white font-bold hover:shadow-lg transition-all text-sm"
                >
                  <Plus className="w-5 h-5" />
                  Add User Account
                </button>
              </>
            ) : (
              <button
                onClick={openCreateRoleModal}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 text-white font-bold hover:shadow-lg transition-all text-sm"
              >
                <Plus className="w-5 h-5" />
                Create Custom Role
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher Pills & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex rounded-2xl bg-gray-100 dark:bg-gray-800/80 p-1.5 w-full sm:w-fit border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === "users"
                  ? "bg-white dark:bg-gray-900 text-purple-700 dark:text-purple-300 shadow-sm border border-gray-200 dark:border-gray-700"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" />
              User Accounts ({users.length})
            </button>
            <button
              onClick={() => setActiveTab("roles")}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === "roles"
                  ? "bg-white dark:bg-gray-900 text-purple-700 dark:text-purple-300 shadow-sm border border-gray-200 dark:border-gray-700"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Shield className="w-4 h-4" />
              Roles & Permissions ({roles.length})
            </button>
          </div>

          {activeTab === "users" && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Filter className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={filterRole}
                  onChange={(e) => {
                    setFilterRole(e.target.value);
                    setSelectedUserIds([]);
                  }}
                  className="pl-9.5 pr-8 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 font-semibold text-sm shadow-sm cursor-pointer"
                >
                  <option value="ALL">All Roles ({users.length})</option>
                  {availableRoleOptions.map((r) => {
                    const count = users.filter(
                      (u) => u.role?.toUpperCase() === r
                    ).length;
                    return (
                      <option key={r} value={r}>
                        {r} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* --- TAB 1: USER ACCOUNTS TABLE --- */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {!isSelectionMode ? (
                <button
                  onClick={() => setIsSelectionMode(true)}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckSquare className="w-4 h-4" />
                  Select Multiple
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleSelectAllUsers}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Select All ({filteredUsers.length})
                  </button>
                  <button
                    onClick={handleUnselectAllUsers}
                    className="text-sm font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:underline cursor-pointer"
                  >
                    Unselect All
                  </button>
                  <button
                    onClick={() => {
                      setIsSelectionMode(false);
                      handleUnselectAllUsers();
                    }}
                    className="text-sm font-semibold text-red-500 hover:text-red-600 hover:underline cursor-pointer"
                  >
                    Exit Selection
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    {isSelectionMode && (
                      <th className="px-4 py-4 text-center w-12">
                        <button
                          onClick={
                            selectedUserIds.length === filteredUsers.length
                              ? handleUnselectAllUsers
                              : handleSelectAllUsers
                          }
                          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          {selectedUserIds.length > 0 &&
                          selectedUserIds.length === filteredUsers.length ? (
                            <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                      </th>
                    )}
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Account Holder
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Role & Permissions
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={isSelectionMode ? 4 : 3} className="py-20 text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={isSelectionMode ? 4 : 3} className="py-12 text-center text-gray-500 font-medium">
                        {searchQuery
                          ? `No user accounts matched "${searchQuery}"`
                          : "No user accounts found."}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const isSelected = selectedUserIds.includes(user.id);
                      return (
                        <tr
                          key={user.id}
                          className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                            isSelected ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                          }`}
                        >
                          {isSelectionMode && (
                            <td className="px-4 py-4 text-center">
                              <button
                                onClick={() => handleToggleSelectUser(user.id)}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                ) : (
                                  <Square className="w-5 h-5" />
                                )}
                              </button>
                            </td>
                          )}
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                            {user.profilePicture ? (
                              <img
                                src={getPublicUrl(user.profilePicture)}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <UserIcon className="text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white leading-none mb-1">
                              {user.memberName}
                            </div>
                            <div className="text-xs text-gray-500 font-medium italic">
                              @{user.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleBadgeColor(
                                user.role
                              )}`}
                            >
                              {user.role}
                            </span>
                            {user.role === "INTERVIEWEE" && user.memberClubDepartment && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                {user.memberClubDepartment}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditUserModal(user)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                              title="Edit User Account"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteUserConfirmId(user.id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                              title="Delete User Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

        {/* --- TAB 2: ROLES & PERMISSIONS GRID --- */}
        {activeTab === "roles" && (
          <div className="space-y-6">
            {/* Info Banner */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
              <div className="text-xs text-purple-900 dark:text-purple-200">
                <p className="font-bold text-sm mb-0.5">Granular Role-Based Access Control</p>
                <p>
                  System roles (<code className="font-bold">MASTER</code>,{" "}
                  <code className="font-bold">ADMIN</code>, <code className="font-bold">MANAGER</code>
                  , <code className="font-bold">INTERVIEWEE</code>) have core presets. Custom roles allow
                  tailoring exact read, write, update, and delete access across specific club administration panels.
                </p>
              </div>
            </div>

            {loadingRoles ? (
              <div className="py-20 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-500" />
              </div>
            ) : filteredRoles.length === 0 ? (
              <div className="py-12 text-center text-gray-500 font-medium">
                {searchQuery ? `No roles matched "${searchQuery}"` : "No roles found."}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredRoles.map((role) => {
                  const isSys = role.is_system;
                  const perms = role.permissions || [];
                  return (
                    <motion.div
                      key={role.role_name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center text-purple-700 dark:text-purple-300">
                              <Shield className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                  {role.role_name}
                                </h3>
                                {isSys ? (
                                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 border border-gray-250 dark:border-gray-700">
                                    <Lock className="w-3 h-3" /> System
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                    Custom Role
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {role.description || "No description provided."}
                              </p>
                            </div>
                          </div>

                          {!isSys && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditRoleModal(role)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                                title="Edit Role Permissions"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteRoleConfirm(role)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                                title="Delete Custom Role"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Permissions Grid Breakdown */}
                        <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                          <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
                            <span>Panel Access & Permissions</span>
                            <span className="text-purple-600 dark:text-purple-400">
                              {perms.includes("*") ? "All Permissions (Full Access)" : `${perms.length} Permissions`}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {ALL_PANELS.map((panel) => {
                              const activeCount = panel.permissions.filter(
                                (p) => perms.includes("*") || perms.includes(p.id)
                              ).length;
                              const hasFullPanel = activeCount === panel.permissions.length;

                              return (
                                <div
                                  key={panel.key}
                                  className={`p-2.5 rounded-xl border text-xs transition-all ${
                                    activeCount > 0
                                      ? "bg-purple-50/40 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/60 text-purple-950 dark:text-purple-200"
                                      : "bg-gray-50 dark:bg-gray-800/40 border-gray-150 dark:border-gray-800 text-gray-400 opacity-60"
                                  }`}
                                >
                                  <div className="flex items-center justify-between font-bold mb-1">
                                    <span>{panel.label}</span>
                                    <span
                                      className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                                        hasFullPanel
                                          ? "bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300"
                                          : activeCount > 0
                                          ? "bg-yellow-100 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-300"
                                          : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                      }`}
                                    >
                                      {activeCount}/{panel.permissions.length}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {panel.permissions.map((p) => {
                                      const isGranted = perms.includes("*") || perms.includes(p.id);
                                      const shortAction = p.id.split("_")[0]; // READ, WRITE, UPDATE, DELETE
                                      return (
                                        <span
                                          key={p.id}
                                          className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                                            isGranted
                                              ? "bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200"
                                              : "bg-gray-100 dark:bg-gray-800 text-gray-400 line-through opacity-40"
                                          }`}
                                        >
                                          {shortAction}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- MODAL 1: ADD / EDIT USER ACCOUNT --- */}
      <AnimatePresence>
        {isUserModalOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={closeUserModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full border border-gray-200 dark:border-gray-800 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingUser ? "Edit Account" : userStep === 1 ? "Select Member" : "Account Details"}
                </h2>
                <button
                  onClick={closeUserModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6">
                {userStep === 1 ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search members..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {filteredMembers.map((member) => {
                        const hasAccount = users.some((u) => u.member_id === member.member_id);
                        return (
                          <button
                            key={member.member_id}
                            disabled={hasAccount}
                            onClick={() => handleSelectMember(member)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                              hasAccount
                                ? "bg-gray-50 dark:bg-gray-850 border-gray-100 dark:border-gray-800 opacity-60 grayscale"
                                : "border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                {member.member_profile_picture_key ? (
                                  <img
                                    src={getPublicUrl(member.member_profile_picture_key)}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <UserIcon className="p-1 text-gray-400" />
                                )}
                              </div>
                              <div className="text-left">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                  {member.member_name}
                                </p>
                                <p className="text-[10px] text-gray-500">{member.member_email}</p>
                              </div>
                            </div>
                            {hasAccount && (
                              <span className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Done
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUserSubmit} className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl mb-4 border border-blue-100 dark:border-blue-900/40">
                      <div className="w-10 h-10 rounded-full bg-blue-200 dark:bg-blue-900 overflow-hidden">
                        {selectedMember?.member_profile_picture_key ? (
                          <img
                            src={getPublicUrl(selectedMember.member_profile_picture_key)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserIcon className="p-2 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-blue-900 dark:text-blue-200">
                          {selectedMember?.member_name}
                        </p>
                        {!editingUser && (
                          <button
                            type="button"
                            onClick={() => setUserStep(1)}
                            className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Change Member
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        required
                        value={userFormData.username}
                        onChange={(e) =>
                          setUserFormData({ ...userFormData, username: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                        {editingUser ? "New Password (leave blank to keep current)" : "Password"}
                      </label>
                      <input
                        type="password"
                        required={!editingUser}
                        value={userFormData.password}
                        onChange={(e) =>
                          setUserFormData({ ...userFormData, password: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                        Assigned Role
                      </label>
                      <select
                        value={userFormData.role}
                        onChange={(e) =>
                          setUserFormData({ ...userFormData, role: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold text-sm"
                      >
                        {roles.map((r) => (
                          <option key={r.role_name} value={r.role_name}>
                            {r.role_name} {r.is_system ? "(System)" : "(Custom)"}
                          </option>
                        ))}
                      </select>
                    </div>

                    {userFormData.role === "INTERVIEWEE" && (
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
                          Interviewee Department *
                        </label>
                        <select
                          value={userFormData.department}
                          onChange={(e) =>
                            setUserFormData({ ...userFormData, department: e.target.value })
                          }
                          className="w-full px-4 py-2 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-semibold text-sm"
                        >
                          <option value="ALL">All Departments</option>
                          <option value="TECHNICAL">Technical</option>
                          <option value="EVENT_MANAGEMENT">Event Management</option>
                          <option value="FINANCE_&_MARKET_RELATIONS">
                            Finance & Market Relations
                          </option>
                          <option value="CREATIVE_&_PHOTOGRAPHY">Creative & Photography</option>
                          <option value="PROMOTION">Promotion</option>
                          <option value="ANCHORING">Anchoring</option>
                        </select>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      {!editingUser && (
                        <button
                          type="button"
                          onClick={() => setUserStep(1)}
                          className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                        >
                          Back
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={isSavingUser}
                        className="flex-[2] py-3 bg-gradient-to-r from-blue-900 to-purple-700 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 text-sm"
                      >
                        {isSavingUser ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                            <span>{editingUser ? "Updating..." : "Creating..."}</span>
                          </>
                        ) : editingUser ? (
                          "Update Account"
                        ) : (
                          "Create Account"
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL 2: CREATE / EDIT CUSTOM ROLE --- */}
      <AnimatePresence>
        {isRoleModalOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            onClick={() => setIsRoleModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full border border-gray-200 dark:border-gray-800 shadow-2xl my-auto flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center text-purple-700 dark:text-purple-300">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {editingRole ? `Edit Role: ${editingRole.role_name}` : "Create Custom Role"}
                    </h2>
                    <p className="text-xs text-gray-500">
                      Configure granular CRUD permissions across panel modules
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsRoleModalOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleRoleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                {/* Role Name & Description */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                      Role Name *
                    </label>
                    <input
                      type="text"
                      required
                      disabled={!!editingRole}
                      placeholder="e.g. EVENT_COORDINATOR"
                      value={roleFormData.role_name}
                      onChange={(e) =>
                        setRoleFormData({
                          ...roleFormData,
                          role_name: e.target.value.replace(/\s+/g, "_").toUpperCase(),
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono font-bold text-sm disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Manages club events and registrations"
                      value={roleFormData.description}
                      onChange={(e) =>
                        setRoleFormData({ ...roleFormData, description: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                </div>

                {/* Permissions Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Panel Permissions ({roleFormData.permissions.length} selected)
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAllPermissions}
                      className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300 dark:text-gray-700">|</span>
                    <button
                      type="button"
                      onClick={deselectAllPermissions}
                      className="text-xs font-semibold text-gray-500 hover:underline"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                {/* Panel-by-Panel Permissions Grid */}
                <div className="space-y-4">
                  {ALL_PANELS.map((panel) => {
                    const panelPermIds = panel.permissions.map((p) => p.id);
                    const allSelected = panelPermIds.every((id) =>
                      roleFormData.permissions.includes(id)
                    );
                    const someSelected =
                      !allSelected &&
                      panelPermIds.some((id) => roleFormData.permissions.includes(id));

                    return (
                      <div
                        key={panel.key}
                        className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-gray-900 dark:text-white">
                              {panel.label} Panel
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => togglePanelPermissions(panel.key)}
                            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                          >
                            {allSelected ? "Clear Panel" : "Select All in Panel"}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {panel.permissions.map((perm) => {
                            const isChecked = roleFormData.permissions.includes(perm.id);
                            return (
                              <button
                                type="button"
                                key={perm.id}
                                onClick={() => togglePermission(perm.id)}
                                className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                                  isChecked
                                    ? "bg-purple-100/70 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-100 shadow-sm"
                                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                                }`}
                              >
                                {isChecked ? (
                                  <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                                ) : (
                                  <Square className="w-4 h-4 text-gray-400 shrink-0" />
                                )}
                                <div>
                                  <p className="text-xs font-bold leading-tight">{perm.label}</p>
                                  <p className="text-[10px] font-mono text-gray-500 opacity-80">
                                    {perm.id}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setIsRoleModalOpen(false)}
                    className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingRole}
                    className="flex-[2] py-3 bg-gradient-to-r from-purple-700 to-indigo-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 text-sm"
                  >
                    {isSavingRole ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                        <span>Saving Role...</span>
                      </>
                    ) : editingRole ? (
                      "Save Changes"
                    ) : (
                      "Create Role"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CONFIRMATION MODAL: DELETE USER --- */}
      <AnimatePresence>
        {deleteUserConfirmId !== null && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-6"
            onClick={() => setDeleteUserConfirmId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-600 dark:text-red-400">
                <Trash2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Delete User
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Are you sure you want to delete this user account? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-4 w-full">
                <button
                  type="button"
                  onClick={() => setDeleteUserConfirmId(null)}
                  className="flex-1 px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-850 text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const id = deleteUserConfirmId;
                    setDeleteUserConfirmId(null);
                    try {
                      await userService.deleteUser(String(id));
                      toast.success("User account deleted successfully!");
                      setSelectedUserIds((prev) => prev.filter((item) => item !== id));
                      await fetchUsers();
                    } catch (error: any) {
                      toast.error(error.message || "Failed to delete user account");
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

      {/* --- CONFIRMATION MODAL: DELETE MULTIPLE USERS --- */}
      <AnimatePresence>
        {deleteMultipleConfirm && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-6"
            onClick={() => setDeleteMultipleConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-600 dark:text-red-400">
                <Trash2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Delete Multiple Users
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Are you sure you want to delete{" "}
                  <strong className="text-gray-900 dark:text-white">
                    {selectedUserIds.length} user account{selectedUserIds.length > 1 ? "s" : ""}
                  </strong>
                  ? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-4 w-full">
                <button
                  type="button"
                  disabled={isDeletingMultiple}
                  onClick={() => setDeleteMultipleConfirm(false)}
                  className="flex-1 px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-850 text-xs transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeletingMultiple}
                  onClick={handleDeleteMultipleUsersConfirm}
                  className="flex-1 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isDeletingMultiple ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    "Delete All"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CONFIRMATION MODAL: DELETE CUSTOM ROLE --- */}
      <AnimatePresence>
        {deleteRoleConfirm !== null && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-6"
            onClick={() => setDeleteRoleConfirm(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-600 dark:text-red-400">
                <Trash2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Delete Role
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Are you sure you want to delete the custom role{" "}
                  <strong className="text-gray-900 dark:text-white">
                    {deleteRoleConfirm.role_name}
                  </strong>
                  ? Any users assigned to this role will lose their granted permissions.
                </p>
              </div>
              <div className="flex gap-4 w-full">
                <button
                  type="button"
                  onClick={() => setDeleteRoleConfirm(null)}
                  className="flex-1 px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-850 text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteRoleConfirm}
                  className="flex-1 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-lg shadow-red-500/20"
                >
                  Delete Role
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
