// Dashboard is hidden for now. The route is kept but redirects to Analytics so
// the dashboard content never shows. To bring it back, restore the export below.
// import Dashboard from '@/views/dashboard';
// export default Dashboard;

import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(tabs)/analytics" />;
}
