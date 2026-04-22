import EditableImage from "./EditableImage";

export default function Avatar({src,big,onChange,editable=false,size='md'}) {
  let widthClass = 'w-12';
  if (big) widthClass = 'w-24';
  if (size === 'sm') widthClass = 'w-8';
  if (size === 'lg') widthClass = 'w-16';

  return (
    <div className='rounded-full overflow-hidden'>
      <EditableImage
        type={'image'}
        src={src}
        onChange={onChange}
        editable={editable}
        className={'rounded-full overflow-hidden ' + widthClass} />
    </div>
  );
}