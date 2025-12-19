
import { Document } from '../utils/document';

export const DocumentList = ({ documents }: { documents: Document[] }) => (
  <ul>
    {documents.map((doc) => (
      <li key={doc.id}>
        <a href={doc.url} target="_blank" rel="noopener noreferrer">
          {doc.name}
        </a>
      </li>
    ))}
  </ul>
);