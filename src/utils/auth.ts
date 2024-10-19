import { supabase } from '../lib/supabaseClient';

export interface User {
  id: string;
  email: string;
  name: string;
  businessName: string;
  subscriptionPlan: string;
  profilePicture?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) throw userError;

      return {
        success: true,
        message: 'Login successful',
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          businessName: userData.business_name,
          subscriptionPlan: userData.subscription_plan
        }
      };
    } else {
      throw new Error('Login failed: No user data returned');
    }
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, message: error.message || 'Login failed' };
  }
};

export const signup = async (email: string, password: string, name: string, businessName: string): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email,
          name,
          business_name: businessName,
          subscription_plan: 'Free' // Default plan
        });

      if (profileError) throw profileError;

      return {
        success: true,
        message: 'Signup successful',
        user: {
          id: data.user.id,
          email: data.user.email!,
          name,
          businessName,
          subscriptionPlan: 'Free'
        }
      };
    } else {
      throw new Error('Signup failed: No user data returned');
    }
  } catch (error: any) {
    console.error('Signup error:', error);
    return { success: false, message: error.message || 'Signup failed' };
  }
};

export const logout = async (): Promise<void> => {
  await supabase.auth.signOut();
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching current user:', error);
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      businessName: data.business_name,
      subscriptionPlan: data.subscription_plan
    };
  }
  return null;
};

export const updateUser = async (userData: Partial<User>): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        name: userData.name,
        business_name: userData.businessName,
      })
      .eq('id', userData.id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: 'User updated successfully',
      user: {
        id: data.id,
        email: data.email,
        name: data.name,
        businessName: data.business_name,
        subscriptionPlan: data.subscription_plan
      }
    };
  } catch (error: any) {
    console.error('Error updating user:', error);
    return { success: false, message: error.message || 'Failed to update user' };
  }
};