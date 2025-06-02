export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'failed',
        message: 'Unauthorized: No user data found'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'failed',
        message: 'You are not authorized to access this resource'
      });
    }
    next();
  };
};

// Specific role checkers
export const checkAdmin = checkRole(['admin']);
export const checkPetugasAdmin = checkRole(['admin', 'petugas']);
export const checkPengawas = checkRole(['admin', 'petugas', 'pengawas']);