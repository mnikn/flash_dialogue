import { IconButton, MenuItem, Select, Stack, TextField } from '@mui/material';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import CompareIcon from '@mui/icons-material/Compare';
import CompareTwoToneIcon from '@mui/icons-material/CompareTwoTone';
import { useState } from 'react';

const I18nTextField = ({
  label,
  value,
  i18nContent,
  i18nKeyValue,
  onI18nKeyChange,
  ...rest
}: {
  label: string;
  value: string;
  i18nKeyValue: string;
  onI18nKeyChange: (e: any) => void;
  i18nContent: { [key: string]: string };
  [key: string]: any;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareLang, setCompareLang] = useState(
    Object.keys(i18nContent)[0] || ''
  );
  return (
    <Stack>
      <Stack style={{ position: 'relative' }} direction="row" spacing={1}>
        <Stack sx={{ position: 'relative', flexGrow: 1 }} direction="row">
          <TextField
            autoFocus
            label={label}
            value={value}
            type="text"
            {...rest}
          />
          <Stack
            sx={{ position: 'absolute', right: '10px', bottom: '10px' }}
            direction="row"
            spacing={0}
          >
            {!expanded && (
              <>
                <IconButton
                  onClick={() => {
                    setExpanded((prev) => !prev);
                  }}
                >
                  <ArrowCircleDownIcon />
                </IconButton>
              </>
            )}
            {expanded && (
              <>
                <IconButton
                  onClick={() => {
                    setExpanded((prev) => !prev);
                  }}
                >
                  <ArrowCircleUpIcon />
                </IconButton>
              </>
            )}
            {compareMode && (
              <IconButton
                onClick={() => {
                  setCompareMode((prev) => !prev);
                }}
              >
                <CompareIcon />
              </IconButton>
            )}
            {!compareMode && (
              <IconButton
                onClick={() => {
                  setCompareMode((prev) => !prev);
                }}
              >
                <CompareTwoToneIcon />
              </IconButton>
            )}
          </Stack>
        </Stack>
        {compareMode && (
          <Stack sx={{ position: 'relative', flexGrow: 1, paddingTop: 0 }}>
            <TextField
              {...rest}
              disabled
              type="text"
              value={i18nContent[compareLang] || ''}
            />

            <Stack
              sx={{ position: 'absolute', right: '10px', bottom: '10px' }}
              direction="row"
            >
              <Select
                labelId="i18n-select-label"
                id="i18n-select"
                value={compareLang}
                label="I18n"
                size="small"
                sx={{ backgroundColor: '#fff', width: '80px' }}
                onChange={(e) => {
                  setCompareLang(e.target.value);
                }}
              >
                {Object.keys(i18nContent).map((item2, j) => {
                  return (
                    /* eslint-disable-next-line */
                    <MenuItem key={j} value={item2}>
                      {item2}
                    </MenuItem>
                  );
                })}
              </Select>
            </Stack>
          </Stack>
        )}
      </Stack>
      {expanded && (
        <TextField
          margin="dense"
          label={`${label} I18n key`}
          type="text"
          required
          size="small"
          value={i18nKeyValue}
          onChange={onI18nKeyChange}
        />
      )}
    </Stack>
  );
};

export default I18nTextField;
