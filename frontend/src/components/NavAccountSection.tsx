"use client";
import React, { useEffect, useState } from "react";

import { logout, getUser } from "@/app/login/actions";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
const NavAccountSection = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);


  const logOut = async () => {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error:", error);
    }
    setUser(null);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    fetchUser();
  }, []);

  return (
    <>
      {loading ? (
        <div>Loading...</div>
      ) : user ? (
        <div className="flex gap-4 items-center justify-center">
          <p>{user.email}</p>
          <button
            className="bg-black text-white font-semibold p-3 rounded-3xl"
            onClick={() => logOut()}
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div>
          <Link
            className="bg-black text-white font-semibold p-3 rounded-3xl"
            href="/login"
          >
            Sign In
          </Link>
        </div>
      )}
    </>
  );
};

export default NavAccountSection;
