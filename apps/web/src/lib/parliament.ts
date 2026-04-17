// All parliament nominee and representative data is now stored in the Supabase database.
// The parliament and parliament-country pages query directly from the 'nominees' and
// 'representatives' tables. Empty state is handled gracefully in each component.
//
// To seed initial parliament data, use the Supabase dashboard or SQL editor.
// Nominees require linked user profiles (created via the auth/application flow).
