import { toast, ToastOptions } from 'react-toastify';

const toastConfig: ToastOptions = {
  position: 'top-right',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: 'dark',
  style: {
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '8px',
    color: '#ffffff',
  },
  progressStyle: {
    background: '#ffffff',
  },
};

export const showSuccessToast = (message: string, options?: ToastOptions) => {
  toast.success(message, {
    ...toastConfig,
    ...options,
  });
};

export const showErrorToast = (message: string, options?: ToastOptions) => {
  toast.error(message, {
    ...toastConfig,
    ...options,
    style: {
      ...toastConfig.style,
      borderColor: '#dc2626',
    },
  });
};

export const showWarningToast = (message: string, options?: ToastOptions) => {
  toast.warning(message, {
    ...toastConfig,
    ...options,
    style: {
      ...toastConfig.style,
      borderColor: '#d97706',
    },
  });
};

export const showInfoToast = (message: string, options?: ToastOptions) => {
  toast.info(message, {
    ...toastConfig,
    ...options,
  });
};

export const showLoadingToast = (message: string, options?: ToastOptions) => {
  return toast.loading(message, {
    ...toastConfig,
    ...options,
  });
};

export const dismissToast = (toastId?: string | number) => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
};

export { toast };
