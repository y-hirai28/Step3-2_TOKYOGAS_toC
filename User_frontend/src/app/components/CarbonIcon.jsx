import { Icon } from '@iconify/react'

export default function CarbonIcon({ name, size = "1em", color, className = "", ...props }) {
  return (
    <Icon 
      icon={`carbon:${name}`} 
      style={{ fontSize: size, color }} 
      className={className}
      {...props}
    />
  )
}

// よく使うアイコンのコンポーネント
export const AnalyticsIcon = (props) => <CarbonIcon name="analytics" {...props} />
export const TrophyIcon = (props) => <CarbonIcon name="trophy" {...props} />
export const TrendingUpIcon = (props) => <CarbonIcon name="trending-up" {...props} />
export const WatsonMLIcon = (props) => <CarbonIcon name="watson-machine-learning" {...props} />
export const ConnectIcon = (props) => <CarbonIcon name="connect" {...props} />
export const LoginIcon = (props) => <CarbonIcon name="login" {...props} />
export const ChatIcon = (props) => <CarbonIcon name="chat" {...props} />
export const EnergyIcon = (props) => <CarbonIcon name="energy" {...props} />
export const DashboardIcon = (props) => <CarbonIcon name="dashboard" {...props} />
export const SettingsIcon = (props) => <CarbonIcon name="settings" {...props} />
export const UserIcon = (props) => <CarbonIcon name="user" {...props} />
export const LogoutIcon = (props) => <CarbonIcon name="logout" {...props} />
export const NotificationIcon = (props) => <CarbonIcon name="notification" {...props} />
export const UploadIcon = (props) => <CarbonIcon name="upload" {...props} />
export const DownloadIcon = (props) => <CarbonIcon name="download" {...props} />
export const MenuIcon = (props) => <CarbonIcon name="menu" {...props} />
export const CloseIcon = (props) => <CarbonIcon name="close" {...props} />
export const SearchIcon = (props) => <CarbonIcon name="search" {...props} />
export const FilterIcon = (props) => <CarbonIcon name="filter" {...props} />
export const CalendarIcon = (props) => <CarbonIcon name="calendar" {...props} />
export const ClockIcon = (props) => <CarbonIcon name="time" {...props} />
export const LocationIcon = (props) => <CarbonIcon name="location" {...props} />
export const MailIcon = (props) => <CarbonIcon name="email" {...props} />
export const PhoneIcon = (props) => <CarbonIcon name="phone" {...props} />
export const LinkIcon = (props) => <CarbonIcon name="link" {...props} />
export const EditIcon = (props) => <CarbonIcon name="edit" {...props} />
export const DeleteIcon = (props) => <CarbonIcon name="trash-can" {...props} />
export const SaveIcon = (props) => <CarbonIcon name="save" {...props} />
export const RefreshIcon = (props) => <CarbonIcon name="refresh" {...props} />
export const HomeIcon = (props) => <CarbonIcon name="home" {...props} />
export const ChevronLeftIcon = (props) => <CarbonIcon name="chevron-left" {...props} />
export const ChevronRightIcon = (props) => <CarbonIcon name="chevron-right" {...props} />
export const ChevronUpIcon = (props) => <CarbonIcon name="chevron-up" {...props} />
export const ChevronDownIcon = (props) => <CarbonIcon name="chevron-down" {...props} />
export const CheckmarkIcon = (props) => <CarbonIcon name="checkmark" {...props} />
export const WarningIcon = (props) => <CarbonIcon name="warning" {...props} />
export const ErrorIcon = (props) => <CarbonIcon name="error" {...props} />
export const InfoIcon = (props) => <CarbonIcon name="information" {...props} />