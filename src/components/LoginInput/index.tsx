"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useRouter } from "next/navigation";

type LoginForm = {
  email: string;
  password: string;
};

export default function Login() {
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange =
    (field: keyof LoginForm) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setLoading(true);

      console.log("Login:", form);

      router.push('/Home')
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: `url("/CFCVFB_FLEET.jpg")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Card
        sx={{
          width: 400,
          backdropFilter: "blur(0px)",
          backgroundColor: "rgba(255,255,255,0.85)",
          borderRadius: 3,
          boxShadow: 6,
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <Image
              src="/CircleLogo.png"
              alt="Logo"
              width={120}
              height={120}
              priority
            />
          </Box>

          <Typography
            variant="h5"
            fontWeight="bold"
            align="center"
            gutterBottom
          >
            Engine Checklist
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Email"
              fullWidth
              margin="normal"
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              required
            />

            <TextField
              label="Password"
              fullWidth
              margin="normal"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange("password")}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowPassword((prev) => !prev)
                      }
                    >
                      {showPassword ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <LoadingButton
              type="submit"
              variant="contained"
              fullWidth
              loading={loading}
              sx={{ mt: 3 }}
            >
              Login
            </LoadingButton>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
