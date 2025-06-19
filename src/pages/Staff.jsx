import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useApp } from '../contexts/AppContext';
import { formatCurrency } from '../utils/currency';

const Staff = () => {
  const { employees, settings } = useApp();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Staff Directory
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {employees.map((employee) => (
          <Card
            key={employee.id}
            sx={{
              width: '100%',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4,
              },
            }}
          >
            <CardContent sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              p: isMobile ? 2 : 3,
            }}>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {employee.name}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 500,
                }}
              >
                {formatCurrency(employee.dailyRate, settings.currency)}/day
              </Typography>
            </CardContent>
          </Card>
        ))}

        {employees.length === 0 && (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 8, 
              bgcolor: 'background.paper',
              borderRadius: 1,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No staff members yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Add employees from the Team Members page
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Staff; 