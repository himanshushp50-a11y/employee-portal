import { useState, type FormEvent } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { updateProfileThunk } from '@/redux/authSlice';
import { useCurrentEmployee } from '@/hooks/useCurrentEmployee';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/utils/utility';
import { showToast } from '@/utils/toast';

export default function Profile() {
  const dispatch = useAppDispatch();
  const employee = useCurrentEmployee();
  const [name, setName] = useState(employee?.name ?? '');
  const [role, setRole] = useState(employee?.role ?? '');

  if (!employee) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await dispatch(
      updateProfileThunk({ name: name.trim() || employee.name, role: role.trim() || employee.role })
    );
    if (updateProfileThunk.rejected.match(result)) {
      showToast.error(result.payload ?? 'Could not update profile.');
    } else {
      showToast.success('Profile updated.');
    }
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">View and update your details here.</p>
      </div>

      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg" style={{ backgroundColor: employee.avatarColor }}>
              {getInitials(employee.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-bold text-foreground">{employee.name}</p>
            <p className="text-sm text-muted-foreground">{employee.email}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit Details</CardTitle>
          <CardDescription>Update your name and designation.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-name">Full Name</Label>
              <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-role">Designation</Label>
              <Input id="profile-role" value={role} onChange={(e) => setRole(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Email</Label>
              <Input value={employee.email} disabled />
            </div>
            <Button type="submit" className="mt-1 w-full sm:w-auto">
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
