import React from 'react';
import { 
  Chip, 
  Box, 
  CircularProgress, 
  Typography 
} from '@mui/material';
import { 
  Sync as SyncIcon, 
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  CloudOff as OfflineIcon
} from '@mui/icons-material';
import { useApp } from '../contexts/AppContext';

const SyncStatus = () => {
  const { syncing, loading, error, isInitialized } = useApp();

  if (!isInitialized && loading) {
    return (
      <Chip
        icon={<CircularProgress size={16} />}
        label="Initializing..."
        color="info"
        variant="outlined"
        size="small"
      />
    );
  }

  if (error) {
    return (
      <Chip
        icon={<ErrorIcon />}
        label="Sync Error"
        color="error"
        variant="outlined"
        size="small"
      />
    );
  }

  if (syncing) {
    return (
      <Chip
        icon={<CircularProgress size={16} />}
        label="Syncing..."
        color="warning"
        variant="outlined"
        size="small"
      />
    );
  }

  return (
    <Chip
      icon={<CheckIcon />}
      label="Synced"
      color="success"
      variant="outlined"
      size="small"
    />
  );
};

export default SyncStatus; 