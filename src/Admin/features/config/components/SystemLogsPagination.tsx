import { Button } from 'react-bootstrap';
import type { ILogPagesInfo } from '../configTypes';

interface SystemLogsPaginationProps {
  info: ILogPagesInfo;
  page: number;
  loading: boolean;
  onPageChange: (newPage: number) => void;
}

export const SystemLogsPagination = ({
  info,
  page,
  loading,
  onPageChange,
}: SystemLogsPaginationProps) => {
  if (!info || info.totalPages <= 1) return null;

  return (
    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mt-3">
      <small className="text-muted">
        Página {info.page} de {info.totalPages} ({info.total} registros en total)
      </small>
      <div className="btn-group">
        <Button
          variant="outline-secondary"
          size="sm"
          disabled={page <= 1 || loading}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </Button>
        <Button
          variant="outline-secondary"
          size="sm"
          disabled={page >= info.totalPages || loading}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
};
