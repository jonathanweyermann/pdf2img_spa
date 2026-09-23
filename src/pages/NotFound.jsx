import { FileQuestion } from 'lucide-react';
import EmptyState from '../components/EmptyState';

export default function NotFound() {
  return (
    <EmptyState
      icon={FileQuestion}
      title="This page doesn't exist"
      body="The link may be broken or the page may have moved. You can still convert a PDF from the home page."
    />
  );
}
