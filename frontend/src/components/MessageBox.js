import Alert from 'react-bootstrap/Alert'

export default function MessageBox(props) {
  return (
    <Alert className="p-5" variant={props.variant || 'info'}>{props.children}</Alert> 
  );
}
