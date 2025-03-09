"use client";
import React, { useEffect, useState } from "react";

import { logout, getUser } from "@/app/login/actions";
import Link from "next/link";

const NavAccountSection = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUser();
      console.log(userData);
      setUser(userData);
      setLoading(false);
    };

    fetchUser();
  }, []);

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : user ? (
        <div>
          <p>{user.email}</p>
          <button onClick={() => logout()}>Sign Out</button>
        </div>
      ) : (
        <div>
          <Link href="/login">Sign In</Link>
        </div>
      )}
    </div>
  );
};

export default NavAccountSection;
