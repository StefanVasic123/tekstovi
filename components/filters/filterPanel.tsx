import { usePosts } from '@/app/context';
import React from 'react';

interface FilterPanelProps {
  show: boolean;
  setter: React.Dispatch<React.SetStateAction<boolean>>;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ show, setter }) => {
  const { selectedGenre, selectedGender, setSelectedGenre, setSelectedGender } =
    usePosts();

  const className =
    'bg-white w-[250px] transition-[margin-right] ease-in-out duration-500 fixed md:static top-0 bottom-0 right-0 z-40';

  const appendClass = show
    ? ' translate-x-0'
    : ' -translate-x-full md:translate-x-0';

  const ModalOverlay: React.FC = () => (
    <div
      className={`flex md:hidden fixed top-0 right-0 bottom-0 left-0 bg-black/50 z-30`}
      onClick={() => {
        setter((oldVal) => !oldVal);
      }}
    />
  );

  return (
    <>
      {show ? (
        <div>
          <div className={`${className}${appendClass}`}>
            <div className='flex items-center justify-center flex-col'>
              <div className='pt-4'>
                <select
                  value={selectedGenre}
                  onChange={(e) => {
                    setSelectedGenre(e.target.value);
                  }}
                  className='p-2 border rounded-md'
                >
                  <option value=''>žanr</option>
                  <option value='folk'>Narodne</option>
                  <option value='pop'>Pop</option>
                  <option value='dancehall'>Moderne</option>
                </select>
              </div>
              <div className='pt-4'>
                <select
                  value={selectedGender}
                  onChange={(e) => {
                    setSelectedGender(e.target.value);
                  }}
                  className='p-2 border rounded-md ml-2'
                >
                  <option value=''>vokal</option>
                  <option value='male'>Muški</option>
                  <option value='female'>Ženski</option>
                  <option value='duet'>Duet</option>
                </select>
              </div>
            </div>
          </div>
          <ModalOverlay />
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default FilterPanel;
