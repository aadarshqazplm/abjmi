// import { useState } from "react";
// import { Navigate } from "react-router-dom";
// import { useForm } from "react-hook-form";
// import { Mail, Lock, ShieldCheck } from "lucide-react";

// import { useAuth } from "../hooks/useAuth";

// interface LoginForm {
//   email: string;
//   password: string;
// }

// export default function Login() {
//   const { user, loginUser } = useAuth();
//   const [loading, setLoading] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<LoginForm>();

//   const onSubmit = async (data: LoginForm) => {
//     try {
//       setLoading(true);
//       await loginUser(data.email, data.password);
//     } catch (err) {
//       console.error(err);
//       alert("Invalid Email or Password");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (user) {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return (
//     <div className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-x-hidden overflow-y-auto bg-stone-100 px-4 py-6 sm:px-6">
      
//       {/* Background */}
//       <div className="pointer-events-none fixed inset-0 z-0">
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#450a0a08,transparent_60%)]" />
//         <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
//           <div className="flex w-full select-none flex-wrap items-center justify-center gap-4 text-center text-[70px] font-black text-red-950 sm:gap-8 sm:text-[130px] lg:text-[180px]">
//             ∑ &nbsp; ∫ &nbsp; π &nbsp; λ &nbsp; Δ
//           </div>
//         </div>
//       </div>

//       {/* Login Card - Reduced border radius slightly to match the compact feel */}
//       <div className="relative z-10 w-full max-w-[22rem] shrink-0 overflow-hidden rounded-[20px] border border-stone-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.1)] sm:max-w-[26rem]">
        
//         {/* Top Banner - Heavily reduced vertical padding (py-5) and margins */}
//         <div className="bg-red-950 px-6 py-5 text-center text-white sm:px-8 sm:py-6">
//           <ShieldCheck
//             size={32}
//             className="mx-auto mb-2 sm:mb-2.5 sm:h-[38px] sm:w-[38px]"
//           />

//           <h1
//             className="text-2xl font-semibold tracking-wide sm:text-3xl"
//             style={{ fontFamily: "Cinzel" }}
//           >
//             ABJMI
//           </h1>

//           <div className="mx-auto mt-2 h-[2px] w-12 rounded-full bg-amber-400 sm:mt-2.5 sm:w-16" />

//           <p className="mt-2 text-xs leading-snug text-stone-200 sm:mt-3 sm:text-sm">
//             Aryabhatta Bulletin of
//             <br />
//             Mathematics & Informatics
//           </p>

//           <p className="mt-2 text-[9px] uppercase tracking-[0.15em] text-amber-300 sm:mt-2.5 sm:text-[10px] sm:tracking-[0.25em]">
//             Editorial Management Portal
//           </p>
//         </div>

//         {/* Form - Tightened padding and space-y */}
//         <div className="px-6 py-5 sm:px-8 sm:py-6">
//           <h2 className="text-center text-lg font-semibold text-red-950 sm:text-xl">
//             Administrator Login
//           </h2>

//           <form
//             onSubmit={handleSubmit(onSubmit)}
//             className="mt-4 space-y-3 sm:mt-5 sm:space-y-4"
//           >
//             {/* Email */}
//             <div>
//               <label className="mb-1 block text-xs font-medium text-stone-700 sm:mb-1.5 sm:text-sm">
//                 Email Address
//               </label>
//               <div className="flex items-center rounded-lg border border-stone-300 bg-stone-50 px-3 transition focus-within:border-red-950 sm:px-3.5">
//                 <Mail
//                   size={16}
//                   className="shrink-0 text-red-950 sm:h-[18px] sm:w-[18px]"
//                 />
//                 <input
//                   type="email"
//                   placeholder="admin@abjmi.org"
//                   {...register("email", {
//                     required: "Email is required",
//                   })}
//                   className="w-full bg-transparent py-2 pl-2.5 text-sm outline-none sm:py-2.5"
//                 />
//               </div>
//               {errors.email && (
//                 <p className="mt-1 text-xs text-red-600">
//                   {errors.email.message}
//                 </p>
//               )}
//             </div>

//             {/* Password */}
//             <div>
//               <label className="mb-1 block text-xs font-medium text-stone-700 sm:mb-1.5 sm:text-sm">
//                 Password
//               </label>
//               <div className="flex items-center rounded-lg border border-stone-300 bg-stone-50 px-3 transition focus-within:border-red-950 sm:px-3.5">
//                 <Lock
//                   size={16}
//                   className="shrink-0 text-red-950 sm:h-[18px] sm:w-[18px]"
//                 />
//                 <input
//                   type="password"
//                   placeholder="••••••••••••"
//                   {...register("password", {
//                     required: "Password is required",
//                   })}
//                   className="w-full bg-transparent py-2 pl-2.5 text-sm outline-none sm:py-2.5"
//                 />
//               </div>
//               {errors.password && (
//                 <p className="mt-1 text-xs text-red-600">
//                   {errors.password.message}
//                 </p>
//               )}
//             </div>

//             {/* Button */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="group relative mt-1 w-full overflow-hidden rounded-lg bg-red-950 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-900 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 sm:py-3 sm:text-base"
//             >
//               <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition duration-700 group-hover:translate-x-full" />
//               <span className="relative">
//                 {loading ? "Authenticating..." : "Sign In as Administrator"}
//               </span>
//             </button>
//           </form>

//           {/* Bottom Indicators - Reduced margins */}
//           <div className="mt-5 border-t border-stone-200 pt-4 text-center sm:mt-6">
//             <p className="text-[11px] font-medium text-stone-500 sm:text-xs">
//               Editorial Management System
//             </p>
//             <p className="mt-1 text-[9px] uppercase tracking-[0.15em] text-red-950 sm:mt-1.5 sm:tracking-[0.25em]">
//               Authorized Personnel Only
//             </p>
//           </div>
//         </div>
//       </div>

   
//     </div>
//   );
// }

import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Mail, Lock, ShieldCheck } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const { user, loginUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      await loginUser(data.email, data.password);
    } catch (err) {
      console.error(err);
      alert("Invalid Email or Password");
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Pure CSS animation for the background symbols (No Canvas required)
  const floatAnimation = `
    @keyframes float {
      0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
      33% { transform: translateY(-20px) translateX(10px) rotate(5deg); }
      66% { transform: translateY(10px) translateX(-15px) rotate(-5deg); }
      100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
    }
    .math-symbol {
      animation: float 15s ease-in-out infinite;
    }
  `;

  return (
    <div className="relative flex min-h-[100dvh] w-full overflow-hidden bg-red-950 font-sans">
      <style>{floatAnimation}</style>

      {/* --- Animated Math Background --- */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-10">
        {/* We use standard divs with pure CSS to avoid canvas */}
        <div className="math-symbol absolute left-[10%] top-[20%] text-6xl font-black text-white/40" style={{ animationDelay: '0s' }}>∑</div>
        <div className="math-symbol absolute left-[45%] top-[15%] text-8xl font-black text-white/30" style={{ animationDelay: '-3s' }}>∫</div>
        <div className="math-symbol absolute left-[25%] top-[60%] text-7xl font-black text-white/40" style={{ animationDelay: '-7s' }}>π</div>
        <div className="math-symbol absolute left-[75%] top-[30%] text-9xl font-black text-white/20" style={{ animationDelay: '-1s' }}>λ</div>
        <div className="math-symbol absolute left-[60%] top-[75%] text-6xl font-black text-white/30" style={{ animationDelay: '-5s' }}>Δ</div>
        <div className="math-symbol absolute left-[85%] top-[65%] text-8xl font-black text-white/20" style={{ animationDelay: '-9s' }}>∞</div>
        <div className="math-symbol absolute left-[5%] top-[80%] text-7xl font-black text-white/20" style={{ animationDelay: '-4s' }}>∇</div>
      </div>

      {/* Add a subtle vignette gradient over the red */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,#3f0909_100%)]" />

      {/* --- Main Layout Container --- */}
      <div className="relative z-10 flex w-full flex-col lg:flex-row">
        
        {/* --- Left Pane: 60% Editorial Branding --- */}
        {/* Visible primarily on desktop, handles its own padding and centering */}
        <div className="hidden lg:flex lg:w-[60%] flex-col justify-center px-16 xl:px-24">
          <ShieldCheck size={64} className="mb-6 text-amber-400" />
          
          <h1 
            className="text-white font-semibold tracking-wide" 
            style={{ fontFamily: "'Cinzel', serif", fontSize: "72px", lineHeight: "1.1" }}
          >
            ABJMI
          </h1>

          {/* Restrained Gold Divider */}
          <div className="mt-8 mb-8 h-[2px] w-32 rounded-full bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.5)]" />

          <h2 className="text-2xl lg:text-3xl font-light text-stone-200 tracking-wide">
            Aryabhatta Bulletin of<br />
            <span className="font-medium text-white">Mathematics & Informatics</span>
          </h2>

          <p className="mt-8 max-w-lg text-lg leading-relaxed text-stone-400">
            Welcome to the centralized editorial portal. This system is restricted to authorized editors, peer reviewers, and administrative staff for the management of academic submissions and peer-review workflows.
          </p>
        </div>

        {/* --- Mobile Branding Header (Only visible on small screens) --- */}
        <div className="flex w-full flex-col items-center justify-center pt-12 pb-6 px-6 text-center lg:hidden">
           <ShieldCheck size={48} className="mb-4 text-amber-400" />
           <h1 className="text-5xl font-semibold tracking-wide text-white" style={{ fontFamily: "'Cinzel', serif" }}>
            ABJMI
          </h1>
          <div className="mt-4 mb-4 h-[2px] w-16 rounded-full bg-[#D4AF37]" />
        </div>

        {/* --- Right Pane: 40% Floating Glass Login Card --- */}
        <div className="flex w-full lg:w-[40%] items-center justify-center px-6 py-6 pb-12 lg:p-12 xl:pr-24">
          
          {/* Glass Card: Frosted white over the dark background */}
          <div className="w-full max-w-[26rem] rounded-[24px] border border-white/40 bg-white/90 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:p-10">
            
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-red-950">
                Administrator Login
              </h2>
              <p className="mt-2 text-sm text-stone-500 font-medium">
                Please authenticate to access the portal.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              
              {/* Email */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">
                  Email Address
                </label>
                <div className="flex items-center rounded-xl border border-stone-300 bg-white/50 px-3.5 transition focus-within:border-red-950 focus-within:bg-white focus-within:ring-1 focus-within:ring-red-950">
                  <Mail size={18} className="shrink-0 text-stone-400" />
                  <input
                    type="email"
                    placeholder="admin@abjmi.org"
                    {...register("email", { required: "Email is required" })}
                    className="w-full bg-transparent py-3 pl-3 text-sm text-stone-800 outline-none placeholder:text-stone-400"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">
                  Password
                </label>
                <div className="flex items-center rounded-xl border border-stone-300 bg-white/50 px-3.5 transition focus-within:border-red-950 focus-within:bg-white focus-within:ring-1 focus-within:ring-red-950">
                  <Lock size={18} className="shrink-0 text-stone-400" />
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    {...register("password", { required: "Password is required" })}
                    className="w-full bg-transparent py-3 pl-3 text-sm text-stone-800 outline-none placeholder:text-stone-400"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group relative mt-4 w-full overflow-hidden rounded-xl bg-red-950 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-900 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition duration-700 group-hover:translate-x-full" />
                <span className="relative">
                  {loading ? "Authenticating..." : "Sign In to Portal"}
                </span>
              </button>
            </form>

            <div className="mt-8 border-t border-stone-200/60 pt-6 text-center">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">
                Authorized Personnel Only
              </p>
            </div>

          </div>
        </div>
      </div>
      
      {/* Absolute Mobile Footer */}
      <div className="absolute bottom-4 left-0 w-full text-center lg:hidden">
        <p className="text-[10px] text-white/40">
          © {new Date().getFullYear()} ABJMI. All rights reserved.
        </p>
      </div>

    </div>
  );
}