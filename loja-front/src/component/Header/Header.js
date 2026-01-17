import React, { useContext, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../component/contexts/AuthContext";
import api from "../../service/Api";
import axios from "axios";
import { showSuccessToast, showErrorToast } from "../../component/Toast/ToastMessage";
import { Box, Typography } from "@mui/material";

// 🔹 valores fixos da sidebar
const SIDEBAR_WIDTH = 230;
const SIDEBAR_COLLAPSED = 80;

const Header = ({ toggleMenu, isMenuCollapsed }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogoutGlobal = async () => {
    try {
      await axios.post(`${api}/employee/logout`, {}, { withCredentials: true });
      logout();
      navigate("/login");
      showSuccessToast("Logout realizado com sucesso!");
    } catch (error) {
      console.error("Erro no logout:", error);
      showErrorToast("Não foi possível encerrar a sessão.");
    }
  };

  const sidebarWidth = isMenuCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH;

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        top: 0,
        left: 0,
        width: `calc(100% - ${sidebarWidth}px)`,
        marginLeft: `${sidebarWidth}px`,
        bgcolor: "#1976d2",
        color: "#fff",
        zIndex: 1100,
        transition: "all 0.3s ease-in-out",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", minHeight: 70 }}>
        {/* Botão de menu */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton aria-label="toggle menu" onClick={toggleMenu} color="inherit">
            <MenuIcon />
          </IconButton>
        </Box>

        {/* Usuário */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, position: "relative" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              padding: "4px 12px",
              bgcolor: "rgba(255,255,255,0.12)",
              borderRadius: "800px",
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
            onClick={handleMenu}
          >
            <AccountCircle />
            <Typography
              sx={{
                fontWeight: 500,
                color: "#fff",
                marginLeft: 1,
                maxWidth: 150,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.nome || "Usuário"}
            </Typography>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            keepMounted
          >
            <MenuItem onClick={handleLogoutGlobal}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
