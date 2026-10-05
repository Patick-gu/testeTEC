export const styles = {
  container: 'flex-1 bg-slate-50 p-4 lg:p-8 overflow-y-auto',
  wrapper: 'max-w-6xl mx-auto flex flex-col gap-6',

  // Header
  headerWrapper: 'flex flex-wrap items-center justify-between gap-4',
  headerTitle: 'text-2xl font-bold text-slate-800',
  headerSubtitle: 'text-slate-500 text-sm mt-1',
  newUserBtn: 'px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-slate-800 transition-colors flex items-center gap-2',

  // Error Alert
  errorAlert: 'bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm flex items-center gap-2',

  // Search
  searchWrapper: 'bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm flex items-center gap-4',
  searchInputWrapper: 'relative flex-1',
  searchIconWrapper: 'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400',
  searchInput: 'w-full bg-slate-50 border border-slate-200/60 text-slate-800 text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all',

  // Table
  tableContainer: 'bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden',
  tableScroll: 'overflow-x-auto',
  table: 'w-full text-left border-collapse',
  tableHead: 'bg-slate-50 border-b border-slate-200/60',
  tableTh: 'px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider',
  tableBody: 'divide-y divide-slate-100',
  tableRow: 'hover:bg-slate-50/50 transition-colors',
  tableTd: 'px-6 py-4',

  // User Cell
  userCellWrapper: 'flex items-center gap-3',
  userAvatar: 'h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0',
  userAvatarText: 'text-slate-600 font-bold text-sm',
  userName: 'text-sm font-semibold text-slate-800',
  userEmail: 'text-xs text-slate-500 font-mono',

  // Badges
  roleBadgeBase: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider',
  roleBadgeAdmin: 'bg-purple-50 text-purple-600 border border-purple-100',
  roleBadgeUser: 'bg-blue-50 text-blue-600 border border-blue-100',
  
  statusBadgeBase: 'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
  statusBadgeActive: 'bg-emerald-50 text-emerald-600',
  statusBadgeOff: 'bg-slate-100 text-slate-500',
  statusDotBase: 'w-1.5 h-1.5 rounded-full',
  statusDotActive: 'bg-emerald-500',
  statusDotOff: 'bg-slate-400',

  // Actions
  actionWrapper: 'flex items-center justify-end gap-2',
  editBtn: 'p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors',
  deleteBtn: 'p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors',

  // Empty State
  emptyStateTd: 'px-6 py-12 text-center text-slate-400',
  emptyStateIcon: 'material-symbols-outlined text-4xl block mb-2 opacity-50',

  // Modal
  modalOverlay: 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm',
  modalBox: 'bg-white rounded-2xl shadow-xl border border-slate-200/60 p-6 w-full max-w-md',
  modalTitle: 'text-lg font-bold text-slate-800 mb-4',
  formWrapper: 'flex flex-col gap-4',
  formLabel: 'block text-xs font-semibold text-slate-700 mb-1',
  formInput: 'w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2 text-sm focus:bg-white focus:border-blue-400 focus:outline-none',
  modalFooter: 'flex items-center gap-3 mt-4 pt-4 border-t border-slate-100',
  cancelBtn: 'flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold rounded-xl transition-colors',
  saveBtn: 'flex-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors'
};
