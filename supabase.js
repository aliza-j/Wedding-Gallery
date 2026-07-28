// Initialize Supabase Client
const SUPABASE_URL = "https://eqccqtayraafjitkfzke.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxY2NxdGF5cmFhZmppdGtmemtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMTkyODgsImV4cCI6MjEwMDc5NTI4OH0.MJFlGE-UJSHkZ6_1ieeOk__XD6JJayFpN58JUk03b1A";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);