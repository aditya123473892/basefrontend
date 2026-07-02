'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Truck, Users, BarChart3, Shield, Zap, Globe } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { FormInput, FormCheckbox, FormButton } from '@/components/forms/FormElements';
import { useToast } from '@/hooks/useToast';

export default function AnimatedAuthPage() {
  const { login, signup, isLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [isLogin, setIsLogin] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const [[page, direction], setPage] = useState([0, 0]);

  const toggleForm = () => {
    const newDirection = isLogin ? 1 : -1;
    setPage([page + newDirection, newDirection]);
    setIsLogin(!isLogin);
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();

    try {
      if (isLogin) {
        // Handle login
        if (!loginEmail || !loginPassword) {
          toast.error('Validation Error', 'Please fill in all fields');
          return;
        }
        const loginSuccess = await login(loginEmail, loginPassword);
        if (loginSuccess) {
          toast.success('Welcome back!', 'Redirecting to dashboard...');
          router.push('/dashboard');
        }
      } else {
        // Handle signup
        if (!companyName || !signupName || !signupEmail || !signupPassword) {
          toast.error('Validation Error', 'Please fill in all required fields');
          return;
        }
        if (!agreeToTerms) {
          toast.error('Validation Error', 'Please agree to the Terms of Service and Privacy Policy');
          return;
        }

        await signup({
          company_name: companyName,
          owner_full_name: signupName,
          owner_email: signupEmail,
          password: signupPassword,
        });

        toast.success('Account created successfully!', 'Welcome to Team eLogisol.');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      toast.error(err.message || 'An error occurred', 'Please try again later');
    }
  };

  const features = [
    {
      icon: Truck,
      title: 'Real-Time Tracking',
      description: 'Monitor your entire fleet with live GPS tracking and instant location updates.',
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Get insights into fuel consumption, driver behavior, and operational efficiency.',
    },
    {
      icon: Users,
      title: 'Driver Management',
      description: 'Manage driver schedules, performance metrics, and compliance requirements.',
    },
    {
      icon: Shield,
      title: 'Security & Compliance',
      description: 'Enterprise-grade security with full regulatory compliance and data protection.',
    },
    {
      icon: Zap,
      title: 'Automated Workflows',
      description: 'Streamline operations with intelligent automation and task scheduling.',
    },
    {
      icon: Globe,
      title: 'Global Operations',
      description: 'Manage fleets across multiple regions with multi-language support.',
    },
  ];

  return (
    <div className="min-h-screen flex bg-white">
      {/* Subtle grid pattern background */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div className="grid grid-cols-8 h-full">
          {[...Array(64)].map((_, i) => (
            <div
              key={i}
              className={`${
                Math.floor(i / 8) % 2 === i % 2 ? 'bg-emerald-600' : 'bg-transparent'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Left Side - Product Info */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative z-10 flex-col justify-between p-12 xl:p-16">
        <div>
          <div className="mb-16">
            <h1 className="text-6xl xl:text-7xl font-bold text-slate-900 mb-4">
              Team <span className="text-emerald-600">eLogisol</span>
            </h1>
            <div className="h-1 w-32 bg-emerald-600"></div>
          </div>

          <div className="mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Fleet Management</h2>
            <p className="text-xl text-slate-500 max-w-xl">
              The complete logistics solution for modern fleet operations. Streamline,
              optimize, and scale your transportation business.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-4xl">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="flex items-start space-x-4 p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-emerald-50/60 hover:border-emerald-200 transition-all">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-semibold mb-1">{feature.title}</h3>
                    <p className="text-slate-500 text-sm">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-slate-400 text-sm">© 2025 Team eLogisol. All rights reserved.</div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="w-full lg:w-1/2 xl:w-2/5 relative z-10 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Team <span className="text-emerald-600">eLogisol</span>
            </h1>
            <p className="text-slate-500">Fleet Management SaaS</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl shadow-slate-200/60 overflow-hidden">
            {/* Toggle Buttons */}
            <div className="relative flex bg-slate-100 p-1 m-6 rounded-lg border border-slate-200">
              <motion.div
                className="absolute top-1 bottom-1 bg-emerald-600 rounded-md"
                initial={false}
                animate={{
                  left: isLogin ? '0.25rem' : '50%',
                  right: isLogin ? '50%' : '0.25rem',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
              <button
                onClick={() => !isLogin && toggleForm()}
                className={`relative z-10 flex-1 py-2.5 text-sm font-semibold transition-colors ${
                  isLogin ? 'text-white' : 'text-slate-500'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => isLogin && toggleForm()}
                className={`relative z-10 flex-1 py-2.5 text-sm font-semibold transition-colors ${
                  !isLogin ? 'text-white' : 'text-slate-500'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form Container */}
            <div className="relative h-[580px] overflow-hidden">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                {isLogin ? (
                  <motion.div
                    key="login"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'spring', stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                    }}
                    className="absolute inset-0 px-6 pb-8"
                  >
                    <div className="mb-8">
                      <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
                      <p className="text-slate-500 text-sm">
                        Enter your credentials to access your account
                      </p>
                    </div>

                    <div className="space-y-5">
                      <FormInput
                        label="Email Address"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="you@example.com"
                      />

                      <FormInput
                        label="Password"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                      />

                      <div className="flex items-center justify-between text-sm pt-2">
                        <FormCheckbox label="Remember me" />
                        <a
                          href="#"
                          className="text-emerald-600 hover:text-emerald-700 transition-colors font-medium"
                        >
                          Forgot password?
                        </a>
                      </div>

                      <div className="pt-2">
                        <FormButton
                          onClick={handleSubmit}
                          loading={isLoading}
                          loadingText="Signing In..."
                        >
                          Sign In
                        </FormButton>
                      </div>

                      <div className="text-center text-sm text-slate-500 pt-4">
                        Don&apos;t have an account?{' '}
                        <button
                          onClick={toggleForm}
                          className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                        >
                          Sign up
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="signup"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'spring', stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                    }}
                    className="absolute inset-0 px-6 pb-8"
                  >
                    <div className="mb-8">
                      <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h2>
                      <p className="text-slate-500 text-sm">Get started with Fleet Management</p>
                    </div>

                    <div className="space-y-4">
                      <FormInput
                        label="Company Name"
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Your Company Ltd"
                      />

                      <FormInput
                        label="Full Name"
                        type="text"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="John Doe"
                      />

                      <FormInput
                        label="Email Address"
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="you@example.com"
                      />

                      <FormInput
                        label="Password"
                        type="password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="••••••••"
                      />

                      <div className="pt-2">
                        <FormCheckbox
                          label="I agree to the Terms of Service and Privacy Policy"
                          checked={agreeToTerms}
                          onChange={(e) => setAgreeToTerms(e.target.checked)}
                        />
                      </div>

                      <div className="pt-2">
                        <FormButton
                          onClick={handleSubmit}
                          loading={isLoading}
                          loadingText="Creating Account..."
                        >
                          Create Account
                        </FormButton>
                      </div>

                      <div className="text-center text-sm text-slate-500 pt-4">
                        Already have an account?{' '}
                        <button
                          onClick={toggleForm}
                          className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                        >
                          Sign in
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}