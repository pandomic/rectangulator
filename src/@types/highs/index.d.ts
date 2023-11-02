declare module 'highs' {
  export interface Column {
    Index: number;
    Lower: number;
    Upper: number | null;
    Primal: number;
    Type: string;
    Name: string;
  }

  export interface Row {
    Index: number;
    Lower: number;
    Upper: number;
    Name: string;
  }

  export interface Solution {
    Status: 'Optimal' | 'Infeasible' | 'Unbounded';
    Columns: Record<string, Column>;
    Rows: Row[];
  }

  type HighsSolver = { solve: (model: string) => Promise<Solution> };

  // eslint-disable-next-line
  function highs(highs_settings: any): Promise<HighsSolver>;
  export default highs;
}
