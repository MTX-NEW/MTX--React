import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  /* Bootstrap 5 utility classes not available in Bootstrap 4 */
  .fs-1 {
    font-size: 2.5rem !important;
  }
  .fs-2 {
    font-size: 2rem !important;
  }
  .fs-3 {
    font-size: 1.75rem !important;
  }
  .fs-4 {
    font-size: 1.5rem !important;
  }
  .fs-5 {
    font-size: 1.25rem !important;
  }
  .fs-6 {
    font-size: 1rem !important;
  }
  
  /* Additional smaller font sizes */
  .fs-7 {
    font-size: 0.875rem !important;
  }
  .fs-8 {
    font-size: 0.75rem !important;
  }
  .fs-9 {
    font-size: 0.625rem !important;
  }
  
  /* Mobile responsive font sizes */
  @media (max-width: 576px) {
    .fs-sm-6 {
      font-size: 1rem !important;
    }
    .fs-sm-7 {
      font-size: 0.875rem !important;
    }
    .fs-sm-8 {
      font-size: 0.75rem !important;
    }
    .fs-sm-9 {
      font-size: 0.625rem !important;
    }
  }
  
  /* Spacing utilities */
  .gap-1 {
    gap: 0.25rem !important;
  }
  .gap-2 {
    gap: 0.5rem !important;
  }
  .gap-3 {
    gap: 1rem !important;
  }
  .gap-4 {
    gap: 1.5rem !important;
  }
  .gap-5 {
    gap: 3rem !important;
  }
  
  /* Mobile spacing utilities */
  @media (max-width: 576px) {
    .gap-sm-1 {
      gap: 0.25rem !important;
    }
    .gap-sm-2 {
      gap: 0.5rem !important;
    }
    .p-sm-1 {
      padding: 0.25rem !important;
    }
    .p-sm-2 {
      padding: 0.5rem !important;
    }
    .px-sm-1 {
      padding-left: 0.25rem !important;
      padding-right: 0.25rem !important;
    }
    .py-sm-1 {
      padding-top: 0.25rem !important;
      padding-bottom: 0.25rem !important;
    }
    .m-sm-1 {
      margin: 0.25rem !important;
    }
    .m-sm-2 {
      margin: 0.5rem !important;
    }
    .mb-sm-1 {
      margin-bottom: 0.25rem !important;
    }
    .mb-sm-2 {
      margin-bottom: 0.5rem !important;
    }
    .mt-sm-1 {
      margin-top: 0.25rem !important;
    }
    .mt-sm-2 {
      margin-top: 0.5rem !important;
    }
  }
`;

export default GlobalStyles; 